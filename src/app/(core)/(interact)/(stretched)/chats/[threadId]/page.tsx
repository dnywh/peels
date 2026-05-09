import { createClient } from "@/utils/supabase/server";
import { ChatConversationClient } from "@/components/ChatPageClient";
import { getSelectedChatThread, isUuid } from "@/features/chat/chatData";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { createPeelsMetadata, noindexFollowMetadata } from "@/utils/seo";

type ChatThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

const getChatThreadPageData = cache(async (threadId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      selectedThread: null,
    };
  }

  const selectedThread = await getSelectedChatThread(
    supabase,
    user.id,
    threadId
  );

  return {
    user,
    selectedThread,
  };
});

function getChatThreadTitle(
  selectedThread: Awaited<ReturnType<typeof getSelectedChatThread>>,
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

  const { user, selectedThread } = await getChatThreadPageData(threadId);

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

  const { user, selectedThread } = await getChatThreadPageData(threadId);

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
