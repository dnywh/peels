-- Chat unread state is server-owned. Authenticated senders can create a
-- message, but they cannot mark it read during insert.

revoke insert on table public.chat_messages from authenticated;

grant insert (
  thread_id,
  sender_id,
  content
) on table public.chat_messages to authenticated;

revoke insert on table public.chat_threads from authenticated;

grant insert (
  listing_id,
  initiator_id,
  owner_id
) on table public.chat_threads to authenticated;

create or replace function private.enforce_chat_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  thread_record public.chat_threads%rowtype;
  jwt_role text;
begin
  jwt_role := nullif(current_setting('request.jwt.claim.role', true), '');

  if jwt_role = 'service_role'
    or ((select auth.uid()) is null and jwt_role is null)
  then
    return new;
  end if;

  new.created_at := timezone('utc'::text, now());
  new.read_at := null;

  if (select auth.uid()) is null or new.sender_id is distinct from (select auth.uid()) then
    raise exception 'Users can only send messages as themselves.'
      using errcode = '42501';
  end if;

  select *
  into thread_record
  from public.chat_threads
  where id = new.thread_id;

  if thread_record.id is null or (
    thread_record.initiator_id is distinct from new.sender_id
    and thread_record.owner_id is distinct from new.sender_id
  ) then
    raise exception 'Users can only send messages in their own threads.'
      using errcode = '42501';
  end if;

  if new.content is null or trim(both from new.content) = '' then
    raise exception 'Message content cannot be empty.'
      using errcode = '23514';
  end if;

  if (
    select count(*)
    from public.chat_messages
    where sender_id = new.sender_id
      and created_at >= now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Too many messages sent recently.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

alter function private.enforce_chat_message_insert() owner to postgres;

revoke all privileges on function private.enforce_chat_message_insert()
  from anon, authenticated, public;
