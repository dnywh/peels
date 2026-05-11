-- The composite (initiator_id, created_at desc) index covers initiator_id-only
-- lookups via its leftmost prefix, so the older single-column index is redundant.

drop index if exists public.chat_threads_initiator_id_idx;
