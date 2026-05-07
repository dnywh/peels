import { createClient } from "@/utils/supabase/server";
import { ChatConversationClient } from "@/components/ChatPageClient";
import { getSelectedChatThread, isUuid } from "@/features/chat/chatData";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

type ChatThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Chats",
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = await params;
  const referenceNow = new Date().toISOString();

  if (!isUuid(threadId)) {
    redirect("/chats");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect_to=/chats/${threadId}`);
  }

  const selectedThread = await getSelectedChatThread(
    supabase,
    user.id,
    threadId
  );

  if (!selectedThread) {
    redirect("/chats");
  }

  return (
    <ChatConversationClient
      user={user}
      hasThreads={true}
      selectedThread={selectedThread}
      referenceNow={referenceNow}
    />
  );
}
