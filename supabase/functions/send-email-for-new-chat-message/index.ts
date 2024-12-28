import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Looks up RESEND_API_KEY from Supabase secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (_request: Request): Promise<Response> => {
  try {
    const { record } = await _request.json();
    if (!record) throw new Error("No record provided");

    console.log("Record:", record);
    // Record: {
    //   id: "e34bc4fe-77e7-4281-9781-535c96fb7a1c",
    //   content: "Simple (message contents here)",
    //   read_at: null,
    //   sender_id: "6b98dc1c-9d3c-45cf-a2dd-d75104b708cc",
    //   thread_id: "896e9547-36e7-4b4a-a7a9-2ee74d8c07a4",
    //   created_at: "2024-12-27T00:07:39.854225+00:00"
    // }

    // 2. Add error handling for required environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey || !RESEND_API_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Add error handling for database queries
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
    console.log("Sender Name:", senderName);

    const senderAvatarUrl = messageData.sender_avatar
      ? `${supabaseUrl}/storage/v1/object/public/avatars/${messageData.sender_avatar}`
      : null;
    console.log("Sender Avatar URL:", senderAvatarUrl);

    const listingUrl =
      `https://peels.app/map/${messageData.thread.listing_slug}`;
    console.log("Listing URL:", listingUrl);

    // Determine recipient_id (the user who isn't the sender)
    const recipientId = messageData.thread.initiator_id === record.sender_id
      ? messageData.thread.owner_id
      : messageData.thread.initiator_id;

    console.log("Sender ID from chat_messages:", record.sender_id);
    console.log("Recipient ID from chat_threads:", recipientId);
    console.log("Message:", record.content);

    // Do auth admin query to get recipient email (keeping this pattern for security)
    const { data: recipientData, error: recipientError } = await supabase.auth
      .admin.getUserById(recipientId);
    console.log("Recipient data:", recipientData);
    if (recipientError) console.log("Recipient error:", recipientError);

    const recipientEmail = recipientData?.user?.email;
    console.log("Recipient Email:", recipientEmail);

    const recipientNameFromMetadata = recipientData?.user?.user_metadata
      ?.first_name;
    console.log("Recipient Name from Metadata:", recipientNameFromMetadata);

    // 4. Consolidate email template into a separate function
    const emailContent = generateEmailContent({
      senderName,
      recipientName: recipientNameFromMetadata,
      messageContent: record.content,
      threadId: record.thread_id,
      listingUrl,
      senderAvatarUrl,
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
    // console.log("Data:", data); // Data: { id: "8a5e1ef4-5bdc-4d21-992f-3918730ce126" }

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
    senderAvatarUrl,
    listingUrl,
  }: {
    senderName: string;
    recipientName: string;
    messageContent: string;
    threadId: string;
    senderAvatarUrl: string | null;
    listingUrl: string;
  },
) {
  // TODO: Only show listing URL if the recipient is NOT the owner of the listing
  return `<header>Peels</header>
    <h1>New message from ${senderName}</h1>
    <p>Hi ${recipientName}, you've received a new message from ${senderName}:</p>
    ${
    senderAvatarUrl
      ? `<img src="${senderAvatarUrl}" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%;" />`
      : ""
  }
    <p>${messageContent}</p>
    <p>You can reply to this message by clicking the link below:</p>
  <p><a href="https://peels.app/chats/${threadId}">Reply in app</a></p>
  <p><a href="${listingUrl}">View listing</a></p>
  <hr/>
  <footer>
  Peels
  <a href="https://peels.app/unsubscribe">Unsubscribe from new message notifications</a>
  <a href="https://peels.app/settings/notifications">Edit notification preferences</a>
  <a href="https://peels.app/privacy">Privacy</a>
  <a href="https://peels.app/terms">Terms</a>
  </footer>`;
}

serve(handler);
