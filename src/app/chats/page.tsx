import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";

export default async function ChatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get threads with messages and listing info
  const { data: threads, error } = await supabase
    .from("chat_threads_with_participants")
    .select(
      `
      *,
      chat_messages_with_senders (*),
      listing:listings (
        name,
        type
      )
    `
    )
    .or(`initiator_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("created_at", {
      foreignTable: "chat_messages_with_senders",
      ascending: true,
    });

  if (error) {
    console.error("Error fetching chat threads:", error);
    return null;
  }

  return <ChatPageClient user={user} threads={threads} />;
}
