-- Rate limits use created_at windows, so authenticated clients must not be
-- able to backdate chat rows. Force server timestamps for client inserts.

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

create or replace function private.enforce_chat_thread_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  jwt_role text;
begin
  jwt_role := nullif(current_setting('request.jwt.claim.role', true), '');

  if jwt_role = 'service_role'
    or ((select auth.uid()) is null and jwt_role is null)
  then
    return new;
  end if;

  new.created_at := timezone('utc'::text, now());

  if (select auth.uid()) is null or new.initiator_id is distinct from (select auth.uid()) then
    raise exception 'Users can only start chat threads as themselves.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.listings
    where listings.id = new.listing_id
      and listings.owner_id = new.owner_id
      and listings.visibility = true
  ) then
    raise exception 'Users can only start chat threads for visible listings with the correct owner.'
      using errcode = '42501';
  end if;

  if (
    select count(*)
    from public.chat_messages
    where sender_id = new.initiator_id
      and created_at >= now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Too many messages sent recently to start a new chat thread.'
      using errcode = '42501';
  end if;

  if (
    select count(*)
    from public.chat_threads
    where initiator_id = new.initiator_id
      and created_at >= now() - interval '1 hour'
  ) >= 6 then
    raise exception 'Too many chat threads started recently.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

alter function private.enforce_chat_thread_insert() owner to postgres;

revoke all privileges on function private.enforce_chat_thread_insert()
  from anon, authenticated, public;
