-- The later (thread_id, created_at desc, id desc) index covers thread message
-- lookups, so this older single-column index only adds write overhead.

drop index if exists public.chat_messages_thread_id_idx;
