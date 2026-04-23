import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ChatThreadRecord } from "@/types/chat";

type ChatsPageProps = {
  params: Promise<{
    threadId?: string[];
  }>;
};

export const metadata: Metadata = {
  title: "Chats",
};

export default async function ChatsPage({ params }: ChatsPageProps) {
  const { threadId: threadIdSegments } = await params;
  const threadId = threadIdSegments?.[0] ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: threads } = await supabase
    .from("chat_threads_with_participants")
    .select(
      `
        *,
        chat_messages_with_senders (*),
        listing:listings_private_data (*)
      `
    )
    .or(`initiator_id.eq.${user.id},owner_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const typedThreads = (threads ?? []) as ChatThreadRecord[];
  const selectedThread =
    threadId && typedThreads.length > 0
      ? (typedThreads.find((thread) => thread.id === threadId) ?? null)
      : null;

  if (threadId && !selectedThread) {
    redirect("/chats");
  }

  return (
    <ChatPageClient
      user={user}
      initialThreads={typedThreads}
      initialThreadId={threadId}
      selectedThread={selectedThread}
    />
  );
}
