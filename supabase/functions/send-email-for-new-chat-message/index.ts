import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { NewChatMessageEmail } from "../_templates/new-chat-message-email.tsx";
// Temporarily required, see below PR comment
import { render } from "npm:@react-email/render";

// Look up required env variables and API keys from Supabase secrets
const generalEmailAddress = Deno.env.get("GENERAL_EMAIL_ADDRESS");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(RESEND_API_KEY);

const handler = async (_request: Request): Promise<Response> => {
  try {
    // Prepare data
    const { record } = await _request.json();
    if (!record) throw new Error("No record provided");
    console.log("Record:", record);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    console.log("Supabase URL:", supabaseUrl);

    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: messageData, error: messageError } = await supabase
      .from("chat_messages_with_senders")
      .select("*, thread:chat_threads_with_participants!thread_id(*)")
      .eq("id", record.id)
      .single();

    if (messageError || !messageData) {
      throw new Error(`Failed to fetch message data: ${messageError?.message}`);
    }

    console.log("Message Data:", messageData);

    // Use the sender name from our view
    const senderName = messageData.sender_first_name;
    console.log("Sender name:", senderName);

    const senderAvatar = messageData.sender_avatar;
    console.log("Sender avatar:", senderAvatar);

    const listingAvatar = messageData.thread.listing_avatar;
    console.log("Listing avatar:", listingAvatar);

    const listingSlug = messageData.thread.listing_slug;
    console.log("Listing slug:", listingSlug);

    const listingName = messageData.thread.listing_name;
    console.log("Listing name:", listingName);

    const listingType = messageData.thread.listing_type;
    console.log("Listing type:", listingType);

    const listingAreaName = messageData.thread.listing_area_name;
    console.log("Listing area name:", listingAreaName);

    // Determine recipient_id (the user who isn't the sender)
    const recipientId = messageData.thread.initiator_id === record.sender_id
      ? messageData.thread.owner_id
      : messageData.thread.initiator_id;

    // Determine recipient's role in the chat (listing owner (host) or the thread initiator (donor)?)
    // This ternary seems opposite to what's logical, but it is correct somehow
    const recipientRole = messageData.thread.owner_id === record.sender_id
      ? "initiator"
      : "owner";

    const recipientName = messageData.thread.owner_id === record.sender_id
      ? messageData.thread.initiator_first_name
      : messageData.thread.owner_first_name;

    // Determine which avatar(s) to show to the recipient
    let avatarMajorUrl: string | null = null;
    let avatarMajorBucket: string | null = null;
    let avatarMinorUrl: string | null = null;

    if (recipientRole === "owner") {
      // If the recipient is the listing owner, always show the sender's avatar as the primary avatar
      avatarMajorUrl = senderAvatar;
      avatarMajorBucket = "avatars";
      avatarMinorUrl = null; // No secondary avatar needed
      console.log("Recipient is owner. Showing sender avatar:", senderAvatar);
    } else {
      // If the recipient is the initiator (donor/guest)
      if (listingType === "residential") {
        // Special case: Residential listings don't have their own avatar.
        // Show the sender's (host's) avatar as the primary avatar.
        avatarMajorUrl = senderAvatar;
        avatarMajorBucket = "avatars";
        avatarMinorUrl = null; // No secondary avatar needed
        console.log(
          "Recipient is initiator (residential). Showing sender avatar:",
          senderAvatar,
        );
      } else {
        // For non-residential listings, show the listing's avatar as primary
        // and the sender's (host's) avatar as secondary.
        avatarMajorUrl = listingAvatar;
        avatarMajorBucket = "listing_avatars";
        avatarMinorUrl = senderAvatar;
        console.log(
          "Recipient is initiator (non-residential). Showing listing avatar:",
          listingAvatar,
          "and sender avatar:",
          senderAvatar,
        );
      }
    }

    console.log("Sender ID from chat_messages:", record.sender_id);
    console.log("Recipient ID from chat_threads:", recipientId);
    console.log("Message:", record.content);
    console.log("Recipient Role:", recipientRole);

    // Do auth admin query to get recipient email (keeping this pattern for security)
    // TODO: Minify this query to just ask for the email address
    const { data: recipientData, error: recipientError } = await supabase.auth
      .admin.getUserById(recipientId);
    console.log("Recipient data:", recipientData);
    if (recipientError) console.log("Recipient error:", recipientError);

    const recipientEmail = recipientData?.user?.email;
    console.log("Recipient Email:", recipientEmail);

    // Prepare and send Resend email via React Email
    const { data, error } = await resend.emails.send({
      from: `Peels <${generalEmailAddress}>`,
      to: [recipientEmail],
      subject: `${senderName} just messaged you`,
      react: NewChatMessageEmail({
        senderName,
        recipientName,
        // messageContent: record.content,
        threadId: record.thread_id,
        listingSlug,
        listingAreaName,
        recipientRole,
        listingName,
        listingType,
        avatarMajorUrl,
        avatarMajorBucket,
        avatarMinorUrl,
      }),
      // Plain text version
      // Can be removed once this PR is merged
      // https://github.com/resend/resend-node/pull/469#issue-2871291956
      text: await render(
        NewChatMessageEmail({
          senderName,
          recipientName,
          // messageContent: record.content,
          threadId: record.thread_id,
          listingSlug,
          listingAreaName,
          recipientRole,
          listingName,
          listingType,
          avatarMajorUrl,
          avatarMajorBucket,
          avatarMinorUrl,
        }),
        { plainText: true },
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
