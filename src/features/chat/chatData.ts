import "server-only";

import { createClient } from "@/utils/supabase/server";
import type {
  ChatListing,
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

type ChatThreadRow = {
  id: string;
  created_at: string;
  listing_id: number | null;
  initiator_id: string | null;
  owner_id: string | null;
};

type ProfileContactCard = {
  id: string;
  first_name: string | null;
  avatar: string | null;
};

type ListingContactCard = ChatListing & {
  id: number;
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
    messages: thread.messages ?? thread.chat_messages ?? [],
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

function keyById<T extends { id: string | number }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}

function uniqueValues<T>(values: Array<T | null | undefined>) {
  return [...new Set(values.filter((value): value is T => value != null))];
}

function toChatListing(
  listing: ChatListing | null | undefined
): ChatListing | null {
  return listing ?? null;
}

async function fetchProfileCards(
  supabase: SupabaseServerClient,
  profileIds: string[]
) {
  if (profileIds.length === 0) {
    return new Map<string, ProfileContactCard>();
  }

  const { data, error } = await supabase
    .from("profile_contact_cards")
    .select("id, first_name, avatar")
    .in("id", profileIds);

  if (error) {
    throw new Error(error.message);
  }

  return keyById((data ?? []) as ProfileContactCard[]);
}

async function fetchListingContactCards(
  supabase: SupabaseServerClient,
  listingIds: number[]
) {
  if (listingIds.length === 0) {
    return new Map<number, ListingContactCard>();
  }

  const { data, error } = await supabase
    .from("listing_contact_cards")
    .select(
      "id, owner_id, owner_first_name, owner_avatar, owner_has_multiple_non_residential_listings, type, area_name, name, slug, avatar"
    )
    .in("id", listingIds);

  if (error) {
    throw new Error(error.message);
  }

  return keyById((data ?? []) as ListingContactCard[]);
}

function composeThreadRecord({
  initiator,
  listing,
  messages,
  owner,
  thread,
}: {
  initiator?: ProfileContactCard;
  listing?: ChatListing;
  messages?: ChatMessageRecord[];
  owner?: ProfileContactCard;
  thread: ChatThreadRow;
}): ChatThreadRecord {
  return {
    id: thread.id,
    created_at: thread.created_at,
    initiator_id: thread.initiator_id,
    initiator_first_name: initiator?.first_name ?? null,
    initiator_avatar: initiator?.avatar ?? null,
    owner_id: thread.owner_id,
    owner_first_name: owner?.first_name ?? null,
    listing: toChatListing(listing),
    messages: messages ?? [],
  };
}

function composePreviewRecord({
  initiator,
  latestMessage,
  listing,
  owner,
  thread,
}: {
  initiator?: ProfileContactCard;
  latestMessage?: ChatMessageRecord;
  listing?: ChatListing;
  owner?: ProfileContactCard;
  thread: ChatThreadRow;
}): ChatThreadPreviewRecord {
  return {
    ...composeThreadRecord({
      initiator,
      listing,
      owner,
      thread,
    }),
    latest_message_id: latestMessage?.id ?? null,
    latest_message_content: latestMessage?.content ?? null,
    latest_message_created_at: latestMessage?.created_at ?? null,
    latest_message_read_at: latestMessage?.read_at ?? null,
    latest_message_sender_id: latestMessage?.sender_id ?? null,
  };
}

export async function getChatThreads(
  supabase: SupabaseServerClient,
  userId: string
) {
  const threadParticipantFilter = getThreadParticipantFilter(userId);
  const threadsResult = await supabase
    .from("chat_threads")
    .select("id, created_at, listing_id, initiator_id, owner_id")
    .or(threadParticipantFilter)
    .order("created_at", { ascending: false });

  if (threadsResult.error) {
    throw new Error(threadsResult.error.message);
  }

  const threads = (threadsResult.data ?? []) as ChatThreadRow[];
  const threadIds = threads.map((thread) => thread.id);
  const profileIds = uniqueValues(
    threads.flatMap((thread) => [thread.initiator_id, thread.owner_id])
  );
  const listingIds = uniqueValues(threads.map((thread) => thread.listing_id));

  const [profileCardsById, listingsById, messagesResult] = await Promise.all([
    fetchProfileCards(supabase, profileIds),
    fetchListingContactCards(supabase, listingIds),
    threadIds.length > 0
      ? supabase.rpc("latest_chat_messages_for_threads", {
          thread_ids: threadIds,
        })
      : { data: [], error: null },
  ]);

  if (messagesResult.error) {
    throw new Error(messagesResult.error.message);
  }

  const latestMessagesByThreadId = new Map<string, ChatMessageRecord>();
  for (const message of (messagesResult.data ?? []) as ChatMessageRecord[]) {
    if (message.thread_id && !latestMessagesByThreadId.has(message.thread_id)) {
      latestMessagesByThreadId.set(message.thread_id, message);
    }
  }

  const previewThreads = threads.map((thread) =>
    composePreviewRecord({
      initiator: thread.initiator_id
        ? profileCardsById.get(thread.initiator_id)
        : undefined,
      latestMessage: latestMessagesByThreadId.get(thread.id),
      listing: thread.listing_id
        ? listingsById.get(thread.listing_id)
        : undefined,
      owner: thread.owner_id
        ? profileCardsById.get(thread.owner_id)
        : undefined,
      thread,
    })
  );
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
    .from("chat_threads")
    .select("id, created_at, listing_id, initiator_id, owner_id")
    .or(threadParticipantFilter)
    .eq("id", threadId)
    .maybeSingle();

  if (selectedThreadResult.error) {
    throw new Error(selectedThreadResult.error.message);
  }

  const thread = selectedThreadResult.data as ChatThreadRow | null;

  if (!thread) {
    return null;
  }

  const profileIds = uniqueValues([thread.initiator_id, thread.owner_id]);
  const listingIds = uniqueValues([thread.listing_id]);

  const [profileCardsById, listingsById, messagesResult] = await Promise.all([
    fetchProfileCards(supabase, profileIds),
    fetchListingContactCards(supabase, listingIds),
    supabase
      .from("chat_messages")
      .select("id, content, created_at, read_at, sender_id, thread_id")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true }),
  ]);

  if (messagesResult.error) {
    throw new Error(messagesResult.error.message);
  }

  const selectedThreadRecord = composeThreadRecord({
    initiator: thread.initiator_id
      ? profileCardsById.get(thread.initiator_id)
      : undefined,
    listing: thread.listing_id
      ? listingsById.get(thread.listing_id)
      : undefined,
    messages: (messagesResult.data ?? []) as ChatMessageRecord[],
    owner: thread.owner_id ? profileCardsById.get(thread.owner_id) : undefined,
    thread,
  });

  return selectedThreadRecord ? toChatThreadView(selectedThreadRecord) : null;
}
