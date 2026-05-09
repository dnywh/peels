import { ChatConversationClient } from "@/components/ChatPageClient";
import { isUuid } from "@/features/chat/chatData";
import { getCurrentSelectedChatThread } from "@/features/chat/chatPageData";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createPeelsMetadata, noindexFollowMetadata } from "@/utils/seo";

type ChatThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

function getChatThreadTitle(
  selectedThread: Awaited<
    ReturnType<typeof getCurrentSelectedChatThread>
  >["selectedThread"],
  userId: string
) {
  if (!selectedThread) return "Chats";

  const otherPersonName =
    selectedThread.initiator_id === userId
      ? selectedThread.owner_first_name
      : selectedThread.initiator_first_name;

  return otherPersonName ? `${otherPersonName} · Chats` : "Chats";
}

export async function generateMetadata({
  params,
}: ChatThreadPageProps): Promise<Metadata> {
  const { threadId } = await params;

  if (!isUuid(threadId)) {
    return createPeelsMetadata({
      ...noindexFollowMetadata,
      canonicalPath: "/chats",
      title: "Chats",
    });
  }

  const { user, selectedThread } = await getCurrentSelectedChatThread(threadId);

  if (!user) {
    return createPeelsMetadata({
      ...noindexFollowMetadata,
      canonicalPath: `/chats/${threadId}`,
      title: "Chats",
    });
  }

  const title = getChatThreadTitle(selectedThread, user.id);

  return createPeelsMetadata({
    ...noindexFollowMetadata,
    canonicalPath: `/chats/${threadId}`,
    title,
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
    },
    twitter: {
      title: `${title} · ${siteConfig.name}`,
    },
  });
}

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { threadId } = await params;
  const referenceNow = new Date().toISOString();

  if (!isUuid(threadId)) {
    redirect("/chats");
  }

  const { user, selectedThread } = await getCurrentSelectedChatThread(threadId);

  if (!user) {
    redirect(`/sign-in?redirect_to=/chats/${threadId}`);
  }

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
