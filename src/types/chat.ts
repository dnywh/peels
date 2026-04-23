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
  id?: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  sender_id?: string | null;
  thread_id?: string | null;
};

export type ChatThreadRecord = {
  id: string;
  initiator_id?: string | null;
  initiator_first_name?: string | null;
  initiator_avatar?: string | null;
  owner_id?: string | null;
  owner_first_name?: string | null;
  listing?: ChatListing | null;
  chat_messages_with_senders?: ChatMessageRecord[] | null;
  chat_messages?: ChatMessageRecord[] | null;
};
