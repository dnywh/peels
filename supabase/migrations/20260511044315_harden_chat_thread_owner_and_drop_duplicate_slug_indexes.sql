-- Remove duplicate slug indexes covered by unique constraints, and ensure
-- client-created chat threads point at the real visible listing owner.

drop index if exists public.public_listings_slug_idx;
drop index if exists public.listing_contact_cards_slug_idx;

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
