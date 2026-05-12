-- Tighten the Data API contract around public read access.
-- Base tables stay protected by RLS; deliberately-shaped views/RPCs are the
-- public API surfaces.

drop policy if exists "Anyone can view limited profile fields" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "insert_growth_tracking" on public.growth_tracking;

drop policy if exists "Anyone can view all active listings" on public.listings;
drop policy if exists "Users can view their own listings regardless of visibility" on public.listings;
drop policy if exists "Users can view their own listings" on public.listings;
create policy "Users can view their own listings"
on public.listings
for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Limit non-admin users to 12 listings" on public.listings;
drop policy if exists "Only admins can create stub listings" on public.listings;
drop policy if exists "Users can create their own listings within limits" on public.listings;
create policy "Users can create their own listings within limits"
on public.listings
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and (
    public.count_user_listings((select auth.uid())) < 12
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
  and (
    coalesce(is_stub, false) = false
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
);

drop policy if exists "Users can update their own listings" on public.listings;
create policy "Users can update their own listings"
on public.listings
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and (
    coalesce(is_stub, false) = false
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
);

drop policy if exists "Users can delete their own listings" on public.listings;
create policy "Users can delete their own listings"
on public.listings
for delete
to authenticated
using (owner_id = (select auth.uid()));

create index if not exists listings_owner_id_idx on public.listings (owner_id);
create index if not exists chat_threads_initiator_id_idx on public.chat_threads (initiator_id);
create index if not exists chat_threads_owner_id_idx on public.chat_threads (owner_id);
create index if not exists chat_messages_thread_id_idx on public.chat_messages (thread_id);

alter function public.count_user_listings(uuid) set search_path = public;
alter function public.count_verified_users_with_listings() set search_path = public;
alter function public.generate_unique_slug() set search_path = public;
alter function public.set_slug_on_insert() set search_path = public;
alter function public.test_cleanup_orphaned_files() set search_path = public;

revoke all privileges on table public.profiles from anon, authenticated, public;
revoke all privileges on table public.listings from anon, authenticated, public;
revoke all privileges on table public.chat_threads from anon, authenticated, public;
revoke all privileges on table public.chat_messages from anon, authenticated, public;
revoke all privileges on table public.growth_tracking from anon, authenticated, public;
revoke all privileges on sequence public.listings_id_seq from anon, authenticated, public;
revoke all privileges on sequence public.growth_tracking_id_seq from anon, authenticated, public;

revoke all privileges on table public.listings_public_data from anon, authenticated, public;
revoke all privileges on table public.listings_private_data from anon, authenticated, public;
revoke all privileges on table public.chat_threads_with_participants from anon, authenticated, public;
revoke all privileges on table public.chat_messages_with_senders from anon, authenticated, public;

alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on tables from authenticated;
alter default privileges for role postgres in schema public revoke all on tables from public;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke all on sequences from authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from public;
alter default privileges for role postgres in schema public revoke all on functions from anon;
alter default privileges for role postgres in schema public revoke all on functions from authenticated;
alter default privileges for role postgres in schema public revoke all on functions from public;

grant select on table public.profiles to authenticated;
grant insert (id, first_name, avatar, is_newsletter_subscribed, preferred_locale)
  on table public.profiles to authenticated;
grant update (first_name, avatar, is_newsletter_subscribed, preferred_locale)
  on table public.profiles to authenticated;

grant select, delete on table public.listings to authenticated;
grant insert (
  id,
  owner_id,
  name,
  description,
  location,
  accepted_items,
  rejected_items,
  photos,
  links,
  visibility,
  type,
  avatar,
  country_code,
  area_name,
  is_stub
) on table public.listings to authenticated;
grant update (
  owner_id,
  name,
  description,
  location,
  accepted_items,
  rejected_items,
  photos,
  links,
  visibility,
  type,
  avatar,
  country_code,
  area_name,
  is_stub
) on table public.listings to authenticated;
grant usage, select on sequence public.listings_id_seq to authenticated;

grant select, insert on table public.chat_threads to authenticated;
grant select, insert on table public.chat_messages to authenticated;
grant update (read_at) on table public.chat_messages to authenticated;

revoke all privileges on function public.check_message_rate_limit(uuid) from anon, authenticated, public;
revoke all privileges on function public.check_thread_initiation_rate_limit(uuid) from anon, authenticated, public;
revoke all privileges on function public.count_user_listings(uuid) from anon, authenticated, public;
revoke all privileges on function public.count_verified_users_with_listings() from anon, authenticated, public;
revoke all privileges on function public.generate_unique_slug() from anon, authenticated, public;
revoke all privileges on function public.handle_new_user() from anon, authenticated, public;
revoke all privileges on function public.rls_auto_enable() from anon, authenticated, public;
revoke all privileges on function public.set_slug_on_insert() from anon, authenticated, public;
revoke all privileges on function public.test_cleanup_orphaned_files() from anon, authenticated, public;
revoke all privileges on function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) from anon, authenticated, public;

grant execute on function public.check_if_email_exists(text) to anon, authenticated;
grant execute on function public.check_message_rate_limit(uuid) to authenticated;
grant execute on function public.check_thread_initiation_rate_limit(uuid) to authenticated;
grant execute on function public.count_user_listings(uuid) to authenticated;
grant execute on function public.generate_unique_slug() to authenticated;
grant execute on function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) to anon, authenticated;

create or replace view public.listings_public_data
with (security_barrier = true, security_invoker = false) as
select
  listings.id,
  listings.created_at,
  listings.name,
  listings.description,
  listings.accepted_items,
  listings.rejected_items,
  case
    when listings.type = any (array['business'::text, 'community'::text]) then listings.photos
    else null::text[]
  end as photos,
  listings.links,
  listings.type,
  case
    when listings.type = any (array['business'::text, 'community'::text]) then listings.avatar
    else null::text
  end as avatar,
  listings.slug,
  jsonb_build_object(
    'latitude', extensions.st_y(listings.location::extensions.geometry),
    'longitude', extensions.st_x(listings.location::extensions.geometry)
  ) as coordinates,
  listings.country_code,
  listings.area_name,
  listings.is_stub,
  exists (
    select 1
    from public.listings as owner_listings
    where owner_listings.owner_id = listings.owner_id
      and owner_listings.visibility = true
      and owner_listings.type in ('community', 'business')
    offset 1
    limit 1
  ) as owner_has_multiple_non_residential_listings,
  listings.homepage_featured,
  listings.homepage_featured_photo_indexes
from public.listings
where listings.visibility = true;

alter view public.listings_public_data owner to postgres;

create or replace view public.listings_private_data
with (security_barrier = true, security_invoker = false) as
select
  listings.id,
  listings.owner_id,
  listings.name,
  listings.description,
  listings.accepted_items,
  listings.rejected_items,
  listings.photos,
  listings.links,
  listings.visibility,
  listings.type,
  listings.avatar,
  listings.slug,
  jsonb_build_object(
    'latitude', extensions.st_y(listings.location::extensions.geometry),
    'longitude', extensions.st_x(listings.location::extensions.geometry)
  ) as coordinates,
  listings.country_code,
  listings.area_name,
  listings.is_stub,
  profiles.first_name as owner_first_name,
  profiles.avatar as owner_avatar,
  exists (
    select 1
    from public.listings as owner_listings
    where owner_listings.owner_id = listings.owner_id
      and owner_listings.visibility = true
      and owner_listings.type in ('community', 'business')
    offset 1
    limit 1
  ) as owner_has_multiple_non_residential_listings,
  listings.homepage_featured,
  listings.homepage_featured_photo_indexes
from public.listings
left join public.profiles on listings.owner_id = profiles.id
where (select auth.role()) = 'service_role'
  or listings.visibility = true
  or listings.owner_id = (select auth.uid())
  or exists (
    select 1
    from public.chat_threads
    where chat_threads.listing_id = listings.id
      and (
        chat_threads.initiator_id = (select auth.uid())
        or chat_threads.owner_id = (select auth.uid())
      )
  );

alter view public.listings_private_data owner to postgres;

create or replace view public.chat_threads_with_participants
with (security_barrier = true, security_invoker = false) as
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
      and owner_listings.visibility = true
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
) as latest_message on true
where (select auth.role()) = 'service_role'
  or chat_threads.initiator_id = (select auth.uid())
  or chat_threads.owner_id = (select auth.uid());

alter view public.chat_threads_with_participants owner to postgres;

create or replace view public.chat_messages_with_senders
with (security_barrier = true, security_invoker = false) as
select
  chat_messages.id,
  chat_messages.created_at,
  chat_messages.thread_id,
  chat_messages.sender_id,
  chat_messages.content,
  chat_messages.read_at,
  profiles.first_name as sender_first_name,
  profiles.avatar as sender_avatar
from public.chat_messages
join public.profiles on chat_messages.sender_id = profiles.id
where (select auth.role()) = 'service_role'
  or exists (
    select 1
    from public.chat_threads
    where chat_threads.id = chat_messages.thread_id
      and (
        chat_threads.initiator_id = (select auth.uid())
        or chat_threads.owner_id = (select auth.uid())
      )
  );

alter view public.chat_messages_with_senders owner to postgres;

revoke all privileges on table public.listings_public_data from anon, authenticated, service_role, public;
revoke all privileges on table public.listings_private_data from anon, authenticated, service_role, public;
revoke all privileges on table public.chat_threads_with_participants from anon, authenticated, service_role, public;
revoke all privileges on table public.chat_messages_with_senders from anon, authenticated, service_role, public;

grant select on table public.listings_public_data to anon, authenticated, service_role;
grant select on table public.listings_private_data to authenticated, service_role;
grant select on table public.chat_threads_with_participants to authenticated, service_role;
grant select on table public.chat_messages_with_senders to authenticated, service_role;
