import { createClient } from "@/utils/supabase/client";
import type { InlineActionResult } from "@/types/actionResult";
import type {
  ChatListing,
  ChatMessageRecord,
  ChatReadResult,
  ChatSendResult,
} from "@/types/chat";

type BrowserSupabaseClient = ReturnType<typeof createClient>;

export function getThreadMessages(
  existingThread?: {
    chat_messages?: ChatMessageRecord[] | null;
    chat_messages_with_senders?: ChatMessageRecord[] | null;
  } | null
) {
  return (
    existingThread?.chat_messages_with_senders ??
    existingThread?.chat_messages ??
    []
  );
}

export async function loadThreadMessages({
  supabase,
  threadId,
}: {
  supabase: BrowserSupabaseClient;
  threadId: string;
}): Promise<InlineActionResult<ChatMessageRecord[]>> {
  const { data, error } = await supabase
    .from("chat_messages_with_senders")
    .select()
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
    data: data ?? [],
  };
}

export async function ensureChatThread({
  listing,
  supabase,
  userId,
}: {
  listing: ChatListing;
  supabase: BrowserSupabaseClient;
  userId: string;
}): Promise<
  InlineActionResult<{
    messages: ChatMessageRecord[];
    threadId: string;
  }>
> {
  if (!listing.id || !listing.owner_id) {
    return {
      success: false,
      error: "Missing listing details for chat.",
    };
  }

  const { data: thread, error } = await supabase
    .from("chat_threads")
    .select("id")
    .match({
      listing_id: listing.id,
      initiator_id: userId,
      owner_id: listing.owner_id,
    })
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (thread?.id) {
    const messagesResult = await loadThreadMessages({
      supabase,
      threadId: thread.id,
    });

    if (!messagesResult.success) {
      return {
        success: false,
        error: messagesResult.error,
      };
    }

    return {
      success: true,
      error: null,
      data: {
        threadId: thread.id,
        messages: messagesResult.data ?? [],
      },
    };
  }

  const { data: newThread, error: createError } = await supabase
    .from("chat_threads")
    .upsert(
      {
        listing_id: listing.id,
        initiator_id: userId,
        owner_id: listing.owner_id,
      },
      {
        onConflict: "listing_id,initiator_id,owner_id",
        ignoreDuplicates: true,
      }
    )
    .select("id")
    .maybeSingle();

  if (createError || !newThread?.id) {
    return {
      success: false,
      error: createError?.message ?? "Unable to create chat thread.",
    };
  }

  return {
    success: true,
    error: null,
    data: {
      threadId: newThread.id,
      messages: [],
    },
  };
}

export async function sendChatMessage({
  content,
  supabase,
  threadId,
  userId,
}: {
  content: string;
  supabase: BrowserSupabaseClient;
  threadId: string;
  userId: string;
}): Promise<InlineActionResult<ChatSendResult>> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      thread_id: threadId,
      sender_id: userId,
      content,
    })
    .select("id, content, created_at, read_at, sender_id, thread_id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Unable to send message.",
    };
  }

  return {
    success: true,
    error: null,
    data: {
      threadId,
      message: data,
    },
  };
}

export async function markChatThreadRead({
  messages,
  supabase,
  threadId,
  userId,
}: {
  messages: ChatMessageRecord[];
  supabase: BrowserSupabaseClient;
  threadId: string;
  userId: string;
}): Promise<InlineActionResult<ChatReadResult>> {
  const unreadMessageIds = messages
    .filter((message) => message.sender_id !== userId && !message.read_at)
    .map((message) => message.id);

  if (unreadMessageIds.length === 0) {
    return {
      success: true,
      error: null,
      data: {
        threadId,
        readAt: "",
        readMessageIds: [],
      },
    };
  }

  const readAt = new Date().toISOString();
  const { error } = await supabase
    .from("chat_messages")
    .update({ read_at: readAt })
    .in("id", unreadMessageIds);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
    data: {
      threadId,
      readAt,
      readMessageIds: unreadMessageIds,
    },
  };
}
