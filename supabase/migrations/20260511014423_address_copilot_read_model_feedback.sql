-- Follow-up hardening and performance fixes from PR review.

alter table public.public_listings
  add column latitude double precision
    generated always as ((coordinates->>'latitude')::double precision) stored,
  add column longitude double precision
    generated always as ((coordinates->>'longitude')::double precision) stored;

create index public_listings_longitude_latitude_idx
  on public.public_listings (longitude, latitude);

create index if not exists chat_messages_thread_id_created_at_id_idx
  on public.chat_messages (thread_id, created_at desc, id desc);

create or replace function public.listings_in_view(
  min_lat double precision,
  min_long double precision,
  max_lat double precision,
  max_long double precision
) returns table(id bigint, slug text, type text, coordinates jsonb)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    public_listings.id,
    public_listings.slug,
    public_listings.type,
    public_listings.coordinates
  from public.public_listings
  where public_listings.latitude between min_lat and max_lat
    and public_listings.longitude between min_long and max_long
$$;

alter function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) owner to postgres;

revoke all privileges on function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) from anon, authenticated, public;

grant execute on function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) to anon, authenticated, service_role;

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
  where auth.uid() is not null
    and chat_messages.thread_id = any(thread_ids)
  order by chat_messages.thread_id, chat_messages.created_at desc, chat_messages.id desc
$$;

alter function public.latest_chat_messages_for_threads(uuid[]) owner to postgres;

revoke all privileges on function public.latest_chat_messages_for_threads(uuid[])
  from anon, authenticated, public;

grant execute on function public.latest_chat_messages_for_threads(uuid[])
  to authenticated, service_role;

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
