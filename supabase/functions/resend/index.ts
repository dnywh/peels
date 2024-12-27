import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Looks up RESEND_API_KEY from Supabase secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const handler = async (_request: Request): Promise<Response> => {
  const { record } = await _request.json();
  console.log("Record:", record);
  // Record: {
  //   id: "e34bc4fe-77e7-4281-9781-535c96fb7a1c",
  //   content: "Simple (message contents here)",
  //   read_at: null,
  //   sender_id: "6b98dc1c-9d3c-45cf-a2dd-d75104b708cc",
  //   thread_id: "896e9547-36e7-4b4a-a7a9-2ee74d8c07a4",
  //   created_at: "2024-12-27T00:07:39.854225+00:00"
  // }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Get thread details to find the recipient
  const { data: threadData } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("id", record.thread_id)
    .single();

  console.log("Thread Data:", threadData);

  // Determine recipient_id (the user who isn't the sender)
  const recipientId = threadData.initiator_id === record.sender_id
    ? threadData.owner_id
    : threadData.initiator_id;

  console.log("Sender ID from chat_messages:", record.sender_id);
  console.log("Recipient ID from chat_threads:", recipientId);
  console.log("Message:", record.content);

  // Get sender's name from the profiles table
  const { data: senderData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", record.sender_id)
    .single();

  const senderName = senderData?.first_name;
  console.log("Sender Name:", senderName);

  // // Get sender and recipient details from auth.users
  // const { data: userData } = await supabase
  //   .from("users")
  //   .select("email")
  //   .in("id", [record.sender_id, recipientId]);

  // console.log("User data:", userData);

  // const sender = userData?.find((u) => u.id === record.sender_id);
  // const recipient = userData?.find((u) => u.id === recipientId);

  // // const senderName = sender?.raw_user_meta_data?.full_name || "A user";
  // const recipientEmail = recipient?.email;

  // console.log("Sender info from auth.users:", sender);
  // // console.log("Sender Name:", senderName);
  // console.log("Recipient Email:", recipientEmail);

  // Do auth admin query to get recipient email
  const { data: recipientData, error: recipientError } = await supabase.auth
    .admin.getUserById(recipientId);
  console.log("Recipient data:", recipientData);
  if (recipientError) console.log("Recipient error:", recipientError);

  const recipientEmail = recipientData?.user?.email;
  console.log("Recipient Email:", recipientEmail);

  const recipientNameFromMetadata = recipientData?.user?.user_metadata
    ?.first_name;
  console.log("Recipient Name from Metadata:", recipientNameFromMetadata);

  const senderNameTodo = senderName;

  const emailContent = `<header>Peels</header>
    <h1>New message from ${senderNameTodo}</h1>
    <p>Hi ${recipientNameFromMetadata}, you've received a new message from ${senderNameTodo}:</p>
  <p>${record.content}</p>
  <p>You can reply to this message by clicking the link below:</p>
  <p><a href="https://peels.app/chats/${record.thread_id}">Reply in app</a></p>
  <p>Or reply by email to ${record.thread_id}-reply@peels.app</p>
  <hr/>
  <footer>
  Peels
  <a href="https://peels.app/unsubscribe">Unsubscribe from new message notifications</a>
  <a href="https://peels.app/settings/notifications">Edit notification preferences</a>
  <a href="https://peels.app/privacy">Privacy</a>
  <a href="https://peels.app/terms">Terms</a>
  </footer>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${senderNameTodo} via Peels <${record.thread_id}-reply@peels.app>`,
      to: [recipientEmail],
      subject: `${senderNameTodo} just messaged you`,
      html: emailContent,
    }),
  });

  const data = await res.json();
  // console.log("Data:", data); // Data: { id: "8a5e1ef4-5bdc-4d21-992f-3918730ce126" }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

serve(handler);
