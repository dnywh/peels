import type { ListingType } from "@/types/listing";

export type ChatUser = {
  id: string;
};

export type ChatListing = {
  id?: number;
  owner_id?: string | null;
  owner_first_name?: string | null;
  owner_avatar?: string | null;
  owner_has_multiple_non_residential_listings?: boolean | null;
  type?: ListingType | string | null;
  area_name?: string | null;
  name?: string | null;
  slug?: string | null;
  avatar?: string | null;
};

export type ChatMessageRecord = {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender_id: string | null;
  thread_id: string | null;
};

export type ChatThreadBase = {
  id: string;
  initiator_id?: string | null;
  initiator_first_name?: string | null;
  initiator_avatar?: string | null;
  owner_id?: string | null;
  owner_first_name?: string | null;
  listing?: ChatListing | null;
};

export type ChatThreadRecord = ChatThreadBase & {
  chat_messages_with_senders?: ChatMessageRecord[] | null;
  chat_messages?: ChatMessageRecord[] | null;
};

export type ChatThreadPreviewRecord = ChatThreadBase & {
  latest_message_id?: string | null;
  latest_message_content?: string | null;
  latest_message_created_at?: string | null;
  latest_message_read_at?: string | null;
  latest_message_sender_id?: string | null;
};

export type ChatThreadListItem = ChatThreadBase & {
  has_unread_messages: boolean;
  last_message: ChatMessageRecord | null;
};

export type ChatThreadView = ChatThreadBase & {
  listing: ChatListing | null;
  messages: ChatMessageRecord[];
};

export type ChatSendResult = {
  message: ChatMessageRecord;
  threadId: string;
};

export type ChatReadResult = {
  readAt: string;
  readMessageIds: string[];
  threadId: string;
};
