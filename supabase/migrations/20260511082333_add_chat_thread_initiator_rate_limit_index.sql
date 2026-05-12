-- Match the thread-start rate-limit predicate:
-- initiator_id = <user> and created_at >= now() - interval '1 hour'.

create index if not exists chat_threads_initiator_id_created_at_idx
  on public.chat_threads (initiator_id, created_at desc);
