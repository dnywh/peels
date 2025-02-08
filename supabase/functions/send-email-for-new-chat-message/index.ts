import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Looks up RESEND_API_KEY from Supabase secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (_request: Request): Promise<Response> => {
  try {
    const { record } = await _request.json();
    if (!record) throw new Error("No record provided");
    console.log("Record:", record);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
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

    const listingSlug = messageData.thread.listing_slug;
    console.log("Listing slug:", listingSlug);

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

    // 4. Consolidate email template into a separate function
    const emailContent = generateEmailContent({
      senderName,
      recipientName,
      messageContent: record.content,
      threadId: record.thread_id,
      listingSlug,
      recipientRole,
    });

    // 5. Add error handling for the email send
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Peels <team@peels.app>`,
        to: [recipientEmail],
        subject: `${senderName} just messaged you`,
        html: emailContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Helper function for email template
function generateEmailContent(
  {
    senderName,
    recipientName,
    messageContent,
    threadId,
    listingSlug,
    recipientRole,
  }: {
    senderName: string;
    recipientName: string;
    messageContent: string;
    threadId: string;
    listingSlug: string;
    recipientRole: string;
  },
) {
  const rootUrl = "https://www.peels.app";

  return `
  <h2>New message on Peels</h2>
  <p>Hi ${recipientName}, you’ve received a new message from ${senderName} on Peels:</p>

  <blockquote>
    <p><em>${messageContent}</em></p>
  </blockquote>

  <p><strong><a href="${rootUrl}/chats/${threadId}">Reply to ${senderName} on Peels</a></strong></p>

  <p>Best, <br/>Peels team</p>

  <footer>
  <p><small>
  ${
    recipientRole === "owner"
      ? `
  Don’t want emails like this? <a href="${rootUrl}/profile/listings/${listingSlug}">Manage</a> your listing to hide or remove it from Peels.
  `
      : `
  You’re receiving this email because you originally reached out to ${senderName} on <a href="${rootUrl}/profile">Peels</a>.
  `
  }
  </small></p>
  </footer>`;
}

serve(handler);
