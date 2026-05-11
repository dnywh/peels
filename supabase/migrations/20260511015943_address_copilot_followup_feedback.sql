-- Follow-up fixes from Copilot review.

drop index if exists public.chat_messages_thread_id_created_at_idx;

create or replace function public.latest_chat_messages_for_threads(thread_ids uuid[])
returns table(
  id uuid,
  content text,
  created_at timestamp with time zone,
  read_at timestamp with time zone,
  sender_id uuid,
  thread_id uuid
)
language sql
security invoker
stable
set search_path = ''
as $$
  select distinct on (chat_messages.thread_id)
    chat_messages.id,
    chat_messages.content,
    chat_messages.created_at,
    chat_messages.read_at,
    chat_messages.sender_id,
    chat_messages.thread_id
  from public.chat_messages
  where (
      (select auth.role()) = 'service_role'
      or (select auth.uid()) is not null
    )
    and chat_messages.thread_id = any(thread_ids)
  order by chat_messages.thread_id, chat_messages.created_at desc, chat_messages.id desc
$$;

alter function public.latest_chat_messages_for_threads(uuid[]) owner to postgres;

revoke all privileges on function public.latest_chat_messages_for_threads(uuid[])
  from anon, authenticated, public;

grant execute on function public.latest_chat_messages_for_threads(uuid[])
  to authenticated, service_role;
