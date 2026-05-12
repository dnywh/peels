-- Support chat sender rate-limit checks in private trigger functions.

create index if not exists chat_messages_sender_id_created_at_idx
  on public.chat_messages (sender_id, created_at desc);
