import { createClient } from "@/utils/supabase/server";
import ChatPageClient from "@/components/ChatPageClient";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type {
  ChatMessageRecord,
  ChatThreadListItem,
  ChatThreadPreviewRecord,
  ChatThreadRecord,
  ChatThreadView,
} from "@/types/chat";

type ChatsPageProps = {
  params: Promise<{
    threadId?: string[];
  }>;
};

type UnreadThreadRow = {
  thread_id: string | null;
};

export const metadata: Metadata = {
  title: "Chats",
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function toChatThreadView(thread: ChatThreadRecord): ChatThreadView {
  return {
    id: thread.id,
    initiator_id: thread.initiator_id ?? null,
    initiator_first_name: thread.initiator_first_name ?? null,
    initiator_avatar: thread.initiator_avatar ?? null,
    owner_id: thread.owner_id ?? null,
    owner_first_name: thread.owner_first_name ?? null,
    listing: thread.listing ?? null,
    messages: thread.chat_messages_with_senders ?? thread.chat_messages ?? [],
  };
}

function toLastMessage(
  thread: ChatThreadPreviewRecord
): ChatMessageRecord | null {
  if (
    thread.latest_message_id == null ||
    thread.latest_message_content == null ||
    thread.latest_message_created_at == null
  ) {
    return null;
  }

  return {
    id: thread.latest_message_id,
    content: thread.latest_message_content,
    created_at: thread.latest_message_created_at,
    read_at: thread.latest_message_read_at ?? null,
    sender_id: thread.latest_message_sender_id ?? null,
    thread_id: thread.id,
  };
}

function toChatThreadListItem(
  thread: ChatThreadPreviewRecord,
  unreadThreadIds: ReadonlySet<string>
): ChatThreadListItem {
  return {
    id: thread.id,
    initiator_id: thread.initiator_id ?? null,
    initiator_first_name: thread.initiator_first_name ?? null,
    initiator_avatar: thread.initiator_avatar ?? null,
    owner_id: thread.owner_id ?? null,
    owner_first_name: thread.owner_first_name ?? null,
    listing: thread.listing ?? null,
    has_unread_messages: unreadThreadIds.has(thread.id),
    last_message: toLastMessage(thread),
  };
}

export default async function ChatsPage({ params }: ChatsPageProps) {
  const { threadId: threadIdSegments } = await params;
  const threadId = threadIdSegments?.[0] ?? null;
  const redirectPath = threadId ? `/chats/${threadId}` : "/chats";
  const referenceNow = new Date().toISOString();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect_to=${redirectPath}`);
  }

  if (threadId && !isUuid(threadId)) {
    redirect("/chats");
  }

  const threadParticipantFilter = `initiator_id.eq.${user.id},owner_id.eq.${user.id}`;

  const [threadsResult, selectedThreadResult] = await Promise.all([
    supabase
      .from("chat_threads_with_participants")
      .select(
        `
          id,
          initiator_id,
          initiator_first_name,
          initiator_avatar,
          owner_id,
          owner_first_name,
          latest_message_id,
          latest_message_content,
          latest_message_created_at,
          latest_message_read_at,
          latest_message_sender_id,
          listing:listings_private_data (*)
        `
      )
      .or(threadParticipantFilter)
      .order("created_at", { ascending: false }),
    threadId
      ? supabase
          .from("chat_threads_with_participants")
          .select(
            `
              id,
              initiator_id,
              initiator_first_name,
              initiator_avatar,
              owner_id,
              owner_first_name,
              listing:listings_private_data (*),
              chat_messages_with_senders (
                id,
                content,
                created_at,
                read_at,
                sender_id,
                thread_id
              )
            `
          )
          .or(threadParticipantFilter)
          .eq("id", threadId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (threadsResult.error) {
    throw new Error(threadsResult.error.message);
  }

  if (selectedThreadResult.error) {
    throw new Error(selectedThreadResult.error.message);
  }

  const previewThreads = (threadsResult.data ??
    []) as ChatThreadPreviewRecord[];
  const previewThreadIds = previewThreads.map((thread) => thread.id);
  const { data: unreadThreads, error: unreadThreadsError } =
    previewThreadIds.length > 0
      ? await supabase.rpc("unread_chat_thread_ids", {
          thread_ids: previewThreadIds,
        })
      : { data: [], error: null };

  if (unreadThreadsError) {
    throw new Error(unreadThreadsError.message);
  }

  const unreadThreadIds = new Set(
    ((unreadThreads as UnreadThreadRow[] | null) ?? [])
      .map((thread) => thread.thread_id)
      .filter((messageThreadId): messageThreadId is string =>
        Boolean(messageThreadId)
      )
  );
  const typedThreads = previewThreads.map((thread) =>
    toChatThreadListItem(thread, unreadThreadIds)
  );
  const selectedThreadRecord =
    selectedThreadResult.data as ChatThreadRecord | null;
  const selectedThread = selectedThreadRecord
    ? toChatThreadView(selectedThreadRecord)
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
      referenceNow={referenceNow}
    />
  );
}
