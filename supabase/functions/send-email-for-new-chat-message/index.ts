import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { NewChatMessageEmail } from "../_templates/new-chat-message-email.tsx";
import { getChatEmailCopy, resolveEmailLocale } from "../_shared/i18n.ts";
import { isMissingPreferredLocaleColumn } from "../_shared/postgrest.ts";
// Temporarily required, see below PR comment
import { render } from "npm:@react-email/render";

// Look up required env variables and API keys from Supabase secrets
const generalEmailAddress = Deno.env.get("GENERAL_EMAIL_ADDRESS");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const handler = async (_request: Request): Promise<Response> => {
  try {
    if (_request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const contentType = _request.headers.get("Content-Type");
    if (!contentType?.toLowerCase().includes("application/json")) {
      return jsonResponse({ error: "Expected JSON request body" }, 400);
    }

    const webhookSecret = Deno.env.get("PEELS_CHAT_MESSAGE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Missing required environment variables");
    }

    if (_request.headers.get("x-peels-webhook-secret") !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare data
    let payload: { record?: { id?: unknown; thread_id?: unknown } };
    try {
      payload = await _request.json();
    } catch (_error) {
      return jsonResponse({ error: "Invalid JSON request body" }, 400);
    }

    const { record } = payload;
    if (!record?.id || typeof record.id !== "string") {
      return jsonResponse({ error: "No record provided" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (
      !supabaseUrl ||
      !supabaseServiceKey ||
      !RESEND_API_KEY ||
      !generalEmailAddress
    ) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(RESEND_API_KEY);
    console.log("Processing chat message email", { messageId: record.id });

    const { data: messageData, error: messageError } = await supabase
      .from("chat_messages")
      .select("id, thread_id, sender_id, content")
      .eq("id", record.id)
      .single();

    if (messageError || !messageData) {
      throw new Error(`Failed to fetch message data: ${messageError?.message}`);
    }

    const { data: threadData, error: threadError } = await supabase
      .from("chat_threads")
      .select("id, listing_id, initiator_id, owner_id")
      .eq("id", messageData.thread_id)
      .single();

    if (threadError || !threadData) {
      throw new Error(`Failed to fetch thread data: ${threadError?.message}`);
    }

    const participantIds = [
      messageData.sender_id,
      threadData.initiator_id,
      threadData.owner_id,
    ].filter(Boolean);

    const { data: participantProfiles, error: participantProfilesError } =
      await supabase
        .from("profile_contact_cards")
        .select("id, first_name, avatar")
        .in("id", participantIds);

    if (participantProfilesError) {
      throw new Error(
        `Failed to fetch participant profiles: ${participantProfilesError.message}`
      );
    }

    const profileById = new Map(
      (participantProfiles ?? []).map((profile) => [profile.id, profile])
    );

    const { data: listingData, error: listingError } = await supabase
      .from("listing_contact_cards")
      .select(
        "id, slug, avatar, name, type, area_name, owner_has_multiple_non_residential_listings"
      )
      .eq("id", threadData.listing_id)
      .single();

    if (listingError || !listingData) {
      throw new Error(`Failed to fetch listing data: ${listingError?.message}`);
    }

    const senderProfile = profileById.get(messageData.sender_id);
    const initiatorProfile = profileById.get(threadData.initiator_id);
    const ownerProfile = profileById.get(threadData.owner_id);

    const senderName = senderProfile?.first_name ?? "Someone";

    const senderAvatar = senderProfile?.avatar;

    const listingAvatar = listingData.avatar;

    const listingSlug = listingData.slug ?? "";

    const listingName = listingData.name;

    const listingType = listingData.type;

    const listingAreaName = listingData.area_name ?? "";

    const ownerHasMultipleNonResidentialListings =
      listingData.owner_has_multiple_non_residential_listings;

    // Determine recipient_id (the user who isn't the sender)
    const recipientId =
      threadData.initiator_id === messageData.sender_id
        ? threadData.owner_id
        : threadData.initiator_id;

    if (!recipientId) {
      throw new Error(`No recipient found for message ${record.id}`);
    }

    // Determine recipient's role in the chat (listing owner (host) or the thread initiator (donor)?)
    // This ternary seems opposite to what's logical, but it is correct somehow
    const recipientRole =
      threadData.owner_id === messageData.sender_id ? "initiator" : "owner";

    const recipientName =
      (threadData.owner_id === messageData.sender_id
        ? initiatorProfile?.first_name
        : ownerProfile?.first_name) ?? "";

    // Determine which avatar(s) to show to the recipient
    let avatarMajorUrl: string | null = null;
    let avatarMajorBucket: string | null = null;
    let avatarMinorUrl: string | null = null;

    if (recipientRole === "owner") {
      // If the recipient is the listing owner, always show the sender's avatar as the primary avatar
      avatarMajorUrl = senderAvatar;
      avatarMajorBucket = "avatars";
      avatarMinorUrl = null; // No secondary avatar needed
    } else {
      // If the recipient is the initiator (donor/guest)
      if (listingType === "residential") {
        // Special case: Residential listings don't have their own avatar.
        // Show the sender's (host's) avatar as the primary avatar.
        avatarMajorUrl = senderAvatar;
        avatarMajorBucket = "avatars";
        avatarMinorUrl = null; // No secondary avatar needed
      } else {
        // For non-residential listings, show the listing's avatar as primary
        // and the sender's (host's) avatar as secondary.
        avatarMajorUrl = listingAvatar;
        avatarMajorBucket = "listing_avatars";
        avatarMinorUrl = senderAvatar;
      }
    }

    // Do auth admin query to get recipient email (keeping this pattern for security)
    // TODO: Minify this query to just ask for the email address
    const { data: recipientData, error: recipientError } =
      await supabase.auth.admin.getUserById(recipientId);
    if (recipientError)
      console.error("Recipient lookup error:", recipientError);

    const recipientEmail = recipientData?.user?.email;

    if (!recipientEmail) {
      throw new Error(`No email found for recipient ${recipientId}`);
    }

    const { data: recipientProfile, error: recipientProfileError } =
      await supabase
        .from("profiles")
        .select("preferred_locale")
        .eq("id", recipientId)
        .single();

    if (
      recipientProfileError &&
      !isMissingPreferredLocaleColumn(recipientProfileError)
    ) {
      console.error(
        "Error loading recipient preferred locale:",
        recipientProfileError
      );
    }

    const locale = resolveEmailLocale({
      preferredLocale: recipientProfile?.preferred_locale,
    });
    const copy = getChatEmailCopy(locale);

    // Prepare and send Resend email via React Email
    const { data, error } = await resend.emails.send({
      from: `Peels <${generalEmailAddress}>`,
      to: [recipientEmail],
      subject: copy.subject.replace("{senderName}", senderName),
      react: NewChatMessageEmail({
        locale,
        senderName,
        recipientName,
        // messageContent: record.content,
        threadId: record.thread_id,
        listingSlug,
        listingAreaName,
        recipientRole,
        listingName,
        listingType,
        ownerHasMultipleNonResidentialListings,
        avatarMajorUrl: avatarMajorUrl || undefined,
        avatarMajorBucket: avatarMajorBucket || undefined,
        avatarMinorUrl: avatarMinorUrl || undefined,
      }),
      // Plain text version
      // Can be removed once this PR is merged
      // https://github.com/resend/resend-node/pull/469#issue-2871291956
      text: await render(
        NewChatMessageEmail({
          locale,
          senderName,
          recipientName,
          // messageContent: record.content,
          threadId: record.thread_id,
          listingSlug,
          listingAreaName,
          recipientRole,
          listingName,
          listingType,
          ownerHasMultipleNonResidentialListings,
          avatarMajorUrl: avatarMajorUrl || undefined,
          avatarMajorBucket: avatarMajorBucket || undefined,
          avatarMinorUrl: avatarMinorUrl || undefined,
        }),
        { plainText: true }
      ),
    });

    if (error) {
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
};

serve(handler);
