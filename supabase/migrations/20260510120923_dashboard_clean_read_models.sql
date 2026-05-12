-- Replace privileged public views with explicit RLS-backed read models.

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

drop view if exists public.chat_messages_with_senders;
drop view if exists public.chat_threads_with_participants;
drop view if exists public.listings_private_data;
drop view if exists public.listings_public_data;

create table public.public_listings (
  id bigint primary key references public.listings (id) on delete cascade,
  created_at timestamp with time zone not null,
  name text,
  description text,
  accepted_items text[],
  rejected_items text[],
  photos text[],
  links text[],
  type text,
  avatar text,
  slug text not null unique,
  coordinates jsonb not null,
  country_code text,
  area_name text,
  is_stub boolean,
  owner_has_multiple_non_residential_listings boolean not null default false,
  homepage_featured boolean not null default false,
  homepage_featured_photo_indexes integer[] not null default '{}'::integer[]
);

create table public.listing_contact_cards (
  id bigint primary key references public.listings (id) on delete cascade,
  created_at timestamp with time zone not null,
  owner_id uuid,
  name text,
  description text,
  accepted_items text[],
  rejected_items text[],
  photos text[],
  links text[],
  visibility boolean,
  type text,
  avatar text,
  slug text not null unique,
  coordinates jsonb not null,
  country_code text,
  area_name text,
  is_stub boolean,
  owner_first_name text,
  owner_avatar text,
  owner_has_multiple_non_residential_listings boolean not null default false,
  homepage_featured boolean not null default false,
  homepage_featured_photo_indexes integer[] not null default '{}'::integer[]
);

create table public.profile_contact_cards (
  id uuid primary key references public.profiles (id) on delete cascade,
  first_name text,
  avatar text
);

alter table public.public_listings enable row level security;
alter table public.listing_contact_cards enable row level security;
alter table public.profile_contact_cards enable row level security;

create policy "Anyone can view public listings"
on public.public_listings
for select
to anon, authenticated
using (true);

create policy "Users can view visible and relevant listing contact cards"
on public.listing_contact_cards
for select
to authenticated
using (
  visibility = true
  or owner_id = (select auth.uid())
  or exists (
    select 1
    from public.chat_threads
    where chat_threads.listing_id = listing_contact_cards.id
      and (
        chat_threads.initiator_id = (select auth.uid())
        or chat_threads.owner_id = (select auth.uid())
      )
  )
);

create policy "Users can view own and chat participant profile contact cards"
on public.profile_contact_cards
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.chat_threads
    where (
      chat_threads.initiator_id = (select auth.uid())
      and chat_threads.owner_id = profile_contact_cards.id
    )
    or (
      chat_threads.owner_id = (select auth.uid())
      and chat_threads.initiator_id = profile_contact_cards.id
    )
  )
);

revoke all privileges on table public.public_listings from anon, authenticated, public;
revoke all privileges on table public.listing_contact_cards from anon, authenticated, public;
revoke all privileges on table public.profile_contact_cards from anon, authenticated, public;

grant select on table public.public_listings to anon, authenticated, service_role;
grant select on table public.listing_contact_cards to authenticated, service_role;
grant select on table public.profile_contact_cards to authenticated, service_role;

create index public_listings_slug_idx on public.public_listings (slug);
create index public_listings_homepage_featured_idx
  on public.public_listings (homepage_featured)
  where homepage_featured = true and is_stub = false;
create index listing_contact_cards_slug_idx on public.listing_contact_cards (slug);
create index listing_contact_cards_owner_id_idx on public.listing_contact_cards (owner_id);

create or replace function private.owner_has_multiple_non_residential_listings(
  p_owner_id uuid
) returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((
    select count(*) >= 2
    from public.listings
    where listings.owner_id = p_owner_id
      and listings.visibility = true
      and listings.type in ('community', 'business')
  ), false)
$$;

create or replace function private.refresh_owner_listing_flags(p_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  has_multiple boolean;
begin
  if p_owner_id is null then
    return;
  end if;

  has_multiple := private.owner_has_multiple_non_residential_listings(p_owner_id);

  update public.public_listings
  set owner_has_multiple_non_residential_listings = has_multiple
  from public.listings
  where public_listings.id = listings.id
    and listings.owner_id = p_owner_id;

  update public.listing_contact_cards
  set owner_has_multiple_non_residential_listings = has_multiple
  where owner_id = p_owner_id;
end;
$$;

create or replace function private.refresh_listing_read_models(p_listing_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing_owner_id uuid;
begin
  select owner_id
  into listing_owner_id
  from public.listings
  where id = p_listing_id;

  if listing_owner_id is null then
    delete from public.public_listings where id = p_listing_id;
    delete from public.listing_contact_cards where id = p_listing_id;
    return;
  end if;

  insert into public.listing_contact_cards (
    id,
    created_at,
    owner_id,
    name,
    description,
    accepted_items,
    rejected_items,
    photos,
    links,
    visibility,
    type,
    avatar,
    slug,
    coordinates,
    country_code,
    area_name,
    is_stub,
    owner_first_name,
    owner_avatar,
    owner_has_multiple_non_residential_listings,
    homepage_featured,
    homepage_featured_photo_indexes
  )
  select
    listings.id,
    listings.created_at,
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
    ),
    listings.country_code,
    listings.area_name,
    listings.is_stub,
    profiles.first_name,
    profiles.avatar,
    private.owner_has_multiple_non_residential_listings(listings.owner_id),
    listings.homepage_featured,
    listings.homepage_featured_photo_indexes
  from public.listings
  left join public.profiles on profiles.id = listings.owner_id
  where listings.id = p_listing_id
  on conflict (id) do update set
    created_at = excluded.created_at,
    owner_id = excluded.owner_id,
    name = excluded.name,
    description = excluded.description,
    accepted_items = excluded.accepted_items,
    rejected_items = excluded.rejected_items,
    photos = excluded.photos,
    links = excluded.links,
    visibility = excluded.visibility,
    type = excluded.type,
    avatar = excluded.avatar,
    slug = excluded.slug,
    coordinates = excluded.coordinates,
    country_code = excluded.country_code,
    area_name = excluded.area_name,
    is_stub = excluded.is_stub,
    owner_first_name = excluded.owner_first_name,
    owner_avatar = excluded.owner_avatar,
    owner_has_multiple_non_residential_listings = excluded.owner_has_multiple_non_residential_listings,
    homepage_featured = excluded.homepage_featured,
    homepage_featured_photo_indexes = excluded.homepage_featured_photo_indexes;

  insert into public.public_listings (
    id,
    created_at,
    name,
    description,
    accepted_items,
    rejected_items,
    photos,
    links,
    type,
    avatar,
    slug,
    coordinates,
    country_code,
    area_name,
    is_stub,
    owner_has_multiple_non_residential_listings,
    homepage_featured,
    homepage_featured_photo_indexes
  )
  select
    listings.id,
    listings.created_at,
    case
      when listings.type in ('business', 'community') then listings.name
      else null::text
    end,
    listings.description,
    listings.accepted_items,
    listings.rejected_items,
    case
      when listings.type in ('business', 'community') then listings.photos
      else null::text[]
    end,
    listings.links,
    listings.type,
    case
      when listings.type in ('business', 'community') then listings.avatar
      else null::text
    end,
    listings.slug,
    jsonb_build_object(
      'latitude', extensions.st_y(listings.location::extensions.geometry),
      'longitude', extensions.st_x(listings.location::extensions.geometry)
    ),
    listings.country_code,
    listings.area_name,
    listings.is_stub,
    private.owner_has_multiple_non_residential_listings(listings.owner_id),
    listings.homepage_featured,
    listings.homepage_featured_photo_indexes
  from public.listings
  where listings.id = p_listing_id
    and listings.visibility = true
  on conflict (id) do update set
    created_at = excluded.created_at,
    name = excluded.name,
    description = excluded.description,
    accepted_items = excluded.accepted_items,
    rejected_items = excluded.rejected_items,
    photos = excluded.photos,
    links = excluded.links,
    type = excluded.type,
    avatar = excluded.avatar,
    slug = excluded.slug,
    coordinates = excluded.coordinates,
    country_code = excluded.country_code,
    area_name = excluded.area_name,
    is_stub = excluded.is_stub,
    owner_has_multiple_non_residential_listings = excluded.owner_has_multiple_non_residential_listings,
    homepage_featured = excluded.homepage_featured,
    homepage_featured_photo_indexes = excluded.homepage_featured_photo_indexes;

  delete from public.public_listings
  where id = p_listing_id
    and not exists (
      select 1
      from public.listings
      where listings.id = p_listing_id
        and listings.visibility = true
    );

  perform private.refresh_owner_listing_flags(listing_owner_id);
end;
$$;

create or replace function private.sync_listing_read_models()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.public_listings where id = old.id;
    delete from public.listing_contact_cards where id = old.id;
    perform private.refresh_owner_listing_flags(old.owner_id);
    return old;
  end if;

  perform private.refresh_listing_read_models(new.id);

  if tg_op = 'UPDATE' and old.owner_id is distinct from new.owner_id then
    perform private.refresh_owner_listing_flags(old.owner_id);
  end if;

  return new;
end;
$$;

create or replace function private.sync_profile_contact_card()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.profile_contact_cards where id = old.id;
    update public.listing_contact_cards
    set owner_first_name = null,
        owner_avatar = null
    where owner_id = old.id;
    return old;
  end if;

  insert into public.profile_contact_cards (id, first_name, avatar)
  values (new.id, new.first_name, new.avatar)
  on conflict (id) do update set
    first_name = excluded.first_name,
    avatar = excluded.avatar;

  update public.listing_contact_cards
  set owner_first_name = new.first_name,
      owner_avatar = new.avatar
  where owner_id = new.id;

  return new;
end;
$$;

insert into public.profile_contact_cards (id, first_name, avatar)
select id, first_name, avatar
from public.profiles
on conflict (id) do update set
  first_name = excluded.first_name,
  avatar = excluded.avatar;

insert into public.listing_contact_cards (
  id,
  created_at,
  owner_id,
  name,
  description,
  accepted_items,
  rejected_items,
  photos,
  links,
  visibility,
  type,
  avatar,
  slug,
  coordinates,
  country_code,
  area_name,
  is_stub,
  owner_first_name,
  owner_avatar,
  owner_has_multiple_non_residential_listings,
  homepage_featured,
  homepage_featured_photo_indexes
)
select
  listings.id,
  listings.created_at,
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
  ),
  listings.country_code,
  listings.area_name,
  listings.is_stub,
  profiles.first_name,
  profiles.avatar,
  private.owner_has_multiple_non_residential_listings(listings.owner_id),
  listings.homepage_featured,
  listings.homepage_featured_photo_indexes
from public.listings
left join public.profiles on profiles.id = listings.owner_id;

insert into public.public_listings (
  id,
  created_at,
  name,
  description,
  accepted_items,
  rejected_items,
  photos,
  links,
  type,
  avatar,
  slug,
  coordinates,
  country_code,
  area_name,
  is_stub,
  owner_has_multiple_non_residential_listings,
  homepage_featured,
  homepage_featured_photo_indexes
)
select
  listings.id,
  listings.created_at,
  case
    when listings.type in ('business', 'community') then listings.name
    else null::text
  end,
  listings.description,
  listings.accepted_items,
  listings.rejected_items,
  case
    when listings.type in ('business', 'community') then listings.photos
    else null::text[]
  end,
  listings.links,
  listings.type,
  case
    when listings.type in ('business', 'community') then listings.avatar
    else null::text
  end,
  listings.slug,
  jsonb_build_object(
    'latitude', extensions.st_y(listings.location::extensions.geometry),
    'longitude', extensions.st_x(listings.location::extensions.geometry)
  ),
  listings.country_code,
  listings.area_name,
  listings.is_stub,
  private.owner_has_multiple_non_residential_listings(listings.owner_id),
  listings.homepage_featured,
  listings.homepage_featured_photo_indexes
from public.listings
where listings.visibility = true;

drop trigger if exists sync_listing_read_models on public.listings;
create trigger sync_listing_read_models
after insert or update or delete on public.listings
for each row execute function private.sync_listing_read_models();

drop trigger if exists sync_profile_contact_card on public.profiles;
create trigger sync_profile_contact_card
after insert or update or delete on public.profiles
for each row execute function private.sync_profile_contact_card();

drop policy if exists "Users can create messages in their threads with rate limit" on public.chat_messages;
create policy "Users can create messages in their threads with rate limit"
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and content is not null
  and trim(both from content) <> ''
  and exists (
    select 1
    from public.chat_threads
    where chat_threads.id = chat_messages.thread_id
      and (
        chat_threads.initiator_id = (select auth.uid())
        or chat_threads.owner_id = (select auth.uid())
      )
  )
);

drop policy if exists "Users can create threads they're involved in" on public.chat_threads;
create policy "Users can create threads they're involved in"
on public.chat_threads
for insert
to authenticated
with check ((select auth.uid()) = initiator_id);

create or replace function private.enforce_chat_message_insert()
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

  if (select auth.uid()) is null or new.sender_id is distinct from (select auth.uid()) then
    raise exception 'Users can only send messages as themselves.'
      using errcode = '42501';
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
    raise exception 'Too many messages sent recently.'
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

drop trigger if exists enforce_chat_message_insert on public.chat_messages;
create trigger enforce_chat_message_insert
before insert on public.chat_messages
for each row execute function private.enforce_chat_message_insert();

drop trigger if exists enforce_chat_thread_insert on public.chat_threads;
create trigger enforce_chat_thread_insert
before insert on public.chat_threads
for each row execute function private.enforce_chat_thread_insert();

drop function if exists public.check_message_rate_limit(uuid);
drop function if exists public.check_thread_initiation_rate_limit(uuid);

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
  where (public_listings.coordinates->>'latitude')::double precision between min_lat and max_lat
    and (public_listings.coordinates->>'longitude')::double precision between min_long and max_long
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

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    is_newsletter_subscribed,
    preferred_locale,
    http_referrer,
    utm_source,
    utm_medium,
    utm_campaign
  )
  values (
    new.id,
    (new.raw_user_meta_data->>'first_name')::text,
    (new.raw_user_meta_data->>'is_newsletter_subscribed')::boolean,
    case
      when (new.raw_user_meta_data->>'preferred_locale')::text in ('en', 'es', 'de', 'pt-BR', 'fr')
        then (new.raw_user_meta_data->>'preferred_locale')::text
      else null
    end,
    (new.raw_user_meta_data->>'http_referrer')::text,
    (new.raw_user_meta_data->>'utm_source')::text,
    (new.raw_user_meta_data->>'utm_medium')::text,
    (new.raw_user_meta_data->>'utm_campaign')::text
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = 'pg_catalog'
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null
      and cmd.schema_name in ('public')
      and cmd.schema_name not in ('pg_catalog', 'information_schema')
      and cmd.schema_name not like 'pg_toast%'
      and cmd.schema_name not like 'pg_temp%'
    then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    end if;
  end loop;
end;
$$;

create or replace function private.test_cleanup_orphaned_files()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  file record;
begin
  raise notice 'Orphaned profile avatars:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'avatars'
      and name not in (
        select avatar from public.profiles where avatar is not null
      )
  loop
    raise notice '%', file.name;
  end loop;

  raise notice 'Orphaned listing avatars:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'listing_avatars'
      and name not in (
        select split_part(avatar, '/', -1)
        from public.listings
        where avatar is not null
      )
  loop
    raise notice '%', file.name;
  end loop;

  raise notice 'Orphaned listing photos:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'listing_photos'
      and name not in (
        select unnest(photos)
        from public.listings
        where photos is not null
      )
  loop
    raise notice '%', file.name;
  end loop;
end;
$$;

do $$
declare
  trigger_to_drop record;
begin
  for trigger_to_drop in
    select trigger_name
    from information_schema.triggers
    where event_object_schema = 'auth'
      and event_object_table = 'users'
      and action_statement like '%public.handle_new_user%'
  loop
    execute format('drop trigger if exists %I on auth.users', trigger_to_drop.trigger_name);
  end loop;
end;
$$;

do $$
declare
  event_trigger_to_drop record;
begin
  for event_trigger_to_drop in
    select evtname
    from pg_event_trigger
    where evtfoid = 'public.rls_auto_enable()'::regprocedure
  loop
    execute format('drop event trigger if exists %I', event_trigger_to_drop.evtname);
  end loop;
exception
  when undefined_function then
    null;
end;
$$;

drop event trigger if exists rls_auto_enable;
drop event trigger if exists trigger_rls_auto_enable;
drop function if exists public.check_if_email_exists(text);
drop function if exists public.handle_new_user();
drop function if exists public.rls_auto_enable();
drop function if exists public.test_cleanup_orphaned_files();

revoke all on all functions in schema private from public, anon, authenticated;
