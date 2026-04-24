create or replace view public.chat_threads_with_participants
with (security_invoker = on) as
select
  chat_threads.id,
  chat_threads.created_at,
  chat_threads.listing_id,
  chat_threads.initiator_id,
  chat_threads.owner_id,
  initiator.first_name as initiator_first_name,
  owner.first_name as owner_first_name,
  listings.slug as listing_slug,
  listings.avatar as listing_avatar,
  listings.name as listing_name,
  listings.type as listing_type,
  listings.area_name as listing_area_name,
  owner.avatar as owner_avatar,
  initiator.avatar as initiator_avatar,
  exists (
    select 1
    from public.listings as owner_listings
    where owner_listings.owner_id = chat_threads.owner_id
      and owner_listings.type in ('community', 'business')
    offset 1
    limit 1
  ) as owner_has_multiple_non_residential_listings,
  latest_message.id as latest_message_id,
  latest_message.content as latest_message_content,
  latest_message.created_at as latest_message_created_at,
  latest_message.read_at as latest_message_read_at,
  latest_message.sender_id as latest_message_sender_id
from public.chat_threads
join public.profiles as initiator on chat_threads.initiator_id = initiator.id
join public.profiles as owner on chat_threads.owner_id = owner.id
join public.listings on chat_threads.listing_id = listings.id
left join lateral (
  select
    chat_messages.id,
    chat_messages.content,
    chat_messages.created_at,
    chat_messages.read_at,
    chat_messages.sender_id
  from public.chat_messages
  where chat_messages.thread_id = chat_threads.id
  order by chat_messages.created_at desc, chat_messages.id desc
  limit 1
) as latest_message on true;

alter view public.chat_threads_with_participants owner to postgres;

revoke all on table public.chat_threads_with_participants
  from anon, authenticated, service_role;

grant select on table public.chat_threads_with_participants
  to authenticated, service_role;

create or replace function public.unread_chat_thread_ids(thread_ids uuid[])
returns table(thread_id uuid)
language sql
security invoker
stable
set search_path = public
as $$
  select distinct chat_messages.thread_id
  from public.chat_messages
  where auth.uid() is not null
    and chat_messages.thread_id = any(thread_ids)
    and chat_messages.sender_id <> auth.uid()
    and chat_messages.read_at is null
$$;

alter function public.unread_chat_thread_ids(uuid[]) owner to postgres;

revoke all on function public.unread_chat_thread_ids(uuid[])
  from anon, authenticated, service_role;

grant execute on function public.unread_chat_thread_ids(uuid[])
  to authenticated, service_role;
