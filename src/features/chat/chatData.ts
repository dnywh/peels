import "server-only";

import { createClient } from "@/utils/supabase/server";
import type {
  ChatMessageRecord,
  ChatThreadListItem,
  ChatThreadPreviewRecord,
  ChatThreadRecord,
  ChatThreadView,
} from "@/types/chat";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type UnreadThreadRow = {
  thread_id: string | null;
};

export function isUuid(value: string) {
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

function getThreadParticipantFilter(userId: string) {
  return `initiator_id.eq.${userId},owner_id.eq.${userId}`;
}

export async function getChatThreads(
  supabase: SupabaseServerClient,
  userId: string
) {
  const threadParticipantFilter = getThreadParticipantFilter(userId);
  const threadsResult = await supabase
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
    .order("created_at", { ascending: false });

  if (threadsResult.error) {
    throw new Error(threadsResult.error.message);
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

  return previewThreads.map((thread) =>
    toChatThreadListItem(thread, unreadThreadIds)
  );
}

export async function getSelectedChatThread(
  supabase: SupabaseServerClient,
  userId: string,
  threadId: string
) {
  const threadParticipantFilter = getThreadParticipantFilter(userId);
  const selectedThreadResult = await supabase
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
    .maybeSingle();

  if (selectedThreadResult.error) {
    throw new Error(selectedThreadResult.error.message);
  }

  const selectedThreadRecord =
    selectedThreadResult.data as ChatThreadRecord | null;

  return selectedThreadRecord ? toChatThreadView(selectedThreadRecord) : null;
}
