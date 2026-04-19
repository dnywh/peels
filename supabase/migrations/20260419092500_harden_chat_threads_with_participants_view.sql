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
  (
    select count(*) >= 2
    from public.listings as owner_listings
    where owner_listings.owner_id = chat_threads.owner_id
      and owner_listings.type in ('community', 'business')
  ) as owner_has_multiple_non_residential_listings
from public.chat_threads
join public.profiles as initiator on chat_threads.initiator_id = initiator.id
join public.profiles as owner on chat_threads.owner_id = owner.id
join public.listings on chat_threads.listing_id = listings.id;

alter view public.chat_threads_with_participants owner to postgres;

revoke all on table public.chat_threads_with_participants
  from anon, authenticated, service_role;

grant select on table public.chat_threads_with_participants
  to authenticated, service_role;

alter view public.listings_public_data
  set (security_invoker = on);

alter view public.listings_private_data
  set (security_invoker = on);

revoke all on table public.listings_public_data
  from anon, authenticated, service_role;

revoke all on table public.listings_private_data
  from anon, authenticated, service_role;

grant select on table public.listings_public_data
  to anon, authenticated, service_role;

grant select on table public.listings_private_data
  to authenticated, service_role;
