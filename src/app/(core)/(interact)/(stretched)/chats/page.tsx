import { createClient } from "@/utils/supabase/server";
import { ChatConversationClient } from "@/components/ChatPageClient";
import { getChatThreads } from "@/features/chat/chatData";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats",
};

export default async function ChatsIndexPage() {
  const referenceNow = new Date().toISOString();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect_to=/chats");
  }

  const threads = await getChatThreads(supabase, user.id);

  return (
    <ChatConversationClient
      user={user}
      hasThreads={threads.length > 0}
      selectedThread={null}
      referenceNow={referenceNow}
    />
  );
}
