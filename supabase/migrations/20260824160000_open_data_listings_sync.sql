-- Open data feed registry and mirrored listing refs for scheduled sync jobs.

create table public.open_data_feeds (
  id text primary key,
  name text not null,
  source_name text not null,
  source_url text not null,
  api_url text not null,
  mapper_id text not null,
  sync_cron text,
  last_sync_at timestamp with time zone,
  last_sync_status text,
  last_sync_stats jsonb
);

create table public.listing_open_data_refs (
  feed_id text not null references public.open_data_feeds (id) on delete cascade,
  external_id text not null,
  listing_id bigint not null references public.listings (id) on delete cascade,
  source_version text,
  content_hash text not null,
  last_seen_at timestamp with time zone not null default now(),
  sync_status text not null default 'active'
    check (sync_status in ('active', 'removed_from_source', 'claimed')),
  primary key (feed_id, external_id),
  unique (listing_id)
);

create index listing_open_data_refs_listing_id_idx
  on public.listing_open_data_refs (listing_id);

create index listing_open_data_refs_feed_active_idx
  on public.listing_open_data_refs (feed_id, sync_status)
  where sync_status = 'active';

alter table public.open_data_feeds enable row level security;
alter table public.listing_open_data_refs enable row level security;

revoke all privileges on table public.open_data_feeds from anon, authenticated, public;
revoke all privileges on table public.listing_open_data_refs from anon, authenticated, public;

grant select, insert, update, delete on table public.open_data_feeds to service_role;
grant select, insert, update, delete on table public.listing_open_data_refs to service_role;

alter table public.public_listings
  add column is_open_data_mirrored boolean not null default false;

alter table public.listing_contact_cards
  add column is_open_data_mirrored boolean not null default false;

create or replace function private.listing_is_open_data_mirrored(p_listing_id bigint)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.listing_open_data_refs refs
    where refs.listing_id = p_listing_id
      and refs.sync_status = 'active'
  )
$$;

alter function private.listing_is_open_data_mirrored(bigint) owner to postgres;

revoke all privileges on function private.listing_is_open_data_mirrored(bigint)
  from anon, authenticated, public;

grant execute on function private.listing_is_open_data_mirrored(bigint) to service_role;

create or replace function private.refresh_listing_read_models(p_listing_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing_owner_id uuid;
  open_data_mirrored boolean;
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

  open_data_mirrored := private.listing_is_open_data_mirrored(p_listing_id);

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
    is_open_data_mirrored,
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
    open_data_mirrored,
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
    is_open_data_mirrored = excluded.is_open_data_mirrored,
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
    is_open_data_mirrored,
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
    open_data_mirrored,
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
    is_open_data_mirrored = excluded.is_open_data_mirrored,
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

alter function private.refresh_listing_read_models(bigint) owner to postgres;

revoke all privileges on function private.refresh_listing_read_models(bigint)
  from anon, authenticated, public;

create or replace function private.refresh_open_data_read_model(p_listing_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_listing_read_models(p_listing_id);
end;
$$;

alter function private.refresh_open_data_read_model(bigint) owner to postgres;

revoke all privileges on function private.refresh_open_data_read_model(bigint)
  from anon, authenticated, public;

grant execute on function private.refresh_open_data_read_model(bigint) to service_role;

create or replace function private.sync_open_data_ref_read_models()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_listing_read_models(old.listing_id);
    return old;
  end if;

  perform private.refresh_listing_read_models(new.listing_id);
  return new;
end;
$$;

alter function private.sync_open_data_ref_read_models() owner to postgres;

revoke all privileges on function private.sync_open_data_ref_read_models()
  from anon, authenticated, public;

drop trigger if exists sync_open_data_ref_read_models on public.listing_open_data_refs;

create trigger sync_open_data_ref_read_models
  after insert or update or delete on public.listing_open_data_refs
  for each row
  execute function private.sync_open_data_ref_read_models();

insert into public.open_data_feeds (
  id,
  name,
  source_name,
  source_url,
  api_url,
  mapper_id,
  sync_cron
)
values (
  'nyc-dsny-food-scrap',
  'NYC food scrap drop-off locations',
  'NYC Open Data / DSNY',
  'https://data.cityofnewyork.us/Environment/Food-Scrap-Drop-Off-Locations-in-NYC/if26-z6xq/about_data',
  'https://data.cityofnewyork.us/api/v3/views/if26-z6xq/query.geojson',
  'nyc-dsny-food-scrap-v1',
  '0 6 * * 1'
)
on conflict (id) do update set
  name = excluded.name,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  api_url = excluded.api_url,
  mapper_id = excluded.mapper_id,
  sync_cron = excluded.sync_cron;

create or replace function private.upsert_open_data_listing(
  p_listing_id bigint,
  p_owner_id uuid,
  p_name text,
  p_description text,
  p_longitude double precision,
  p_latitude double precision,
  p_area_name text,
  p_country_code text,
  p_accepted_items text[],
  p_rejected_items text[],
  p_links text[],
  p_type text,
  p_is_stub boolean,
  p_visibility boolean
) returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  result_id bigint;
begin
  if p_type not in ('community', 'business', 'residential') then
    raise exception 'Invalid listing type: %', p_type;
  end if;

  if p_listing_id is null then
    insert into public.listings (
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
    )
    values (
      p_owner_id,
      p_name,
      p_description,
      extensions.st_setsrid(
        extensions.st_makepoint(p_longitude, p_latitude),
        4326
      )::extensions.geography,
      coalesce(p_accepted_items, '{}'::text[]),
      coalesce(p_rejected_items, '{}'::text[]),
      '{}'::text[],
      coalesce(p_links, '{}'::text[]),
      p_visibility,
      p_type,
      null,
      p_country_code,
      p_area_name,
      p_is_stub
    )
    returning id into result_id;
  else
    update public.listings
    set
      name = p_name,
      description = p_description,
      location = extensions.st_setsrid(
        extensions.st_makepoint(p_longitude, p_latitude),
        4326
      )::extensions.geography,
      accepted_items = coalesce(p_accepted_items, '{}'::text[]),
      rejected_items = coalesce(p_rejected_items, '{}'::text[]),
      links = coalesce(p_links, '{}'::text[]),
      visibility = p_visibility,
      type = p_type,
      country_code = p_country_code,
      area_name = p_area_name,
      is_stub = p_is_stub
    where id = p_listing_id
    returning id into result_id;
  end if;

  return result_id;
end;
$$;

alter function private.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) owner to postgres;

revoke all privileges on function private.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) from anon, authenticated, public;

grant execute on function private.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) to service_role;

create or replace function public.upsert_open_data_listing(
  p_listing_id bigint,
  p_owner_id uuid,
  p_name text,
  p_description text,
  p_longitude double precision,
  p_latitude double precision,
  p_area_name text,
  p_country_code text,
  p_accepted_items text[],
  p_rejected_items text[],
  p_links text[],
  p_type text,
  p_is_stub boolean,
  p_visibility boolean
) returns bigint
language sql
security definer
set search_path = ''
as $$
  select private.upsert_open_data_listing(
    p_listing_id,
    p_owner_id,
    p_name,
    p_description,
    p_longitude,
    p_latitude,
    p_area_name,
    p_country_code,
    p_accepted_items,
    p_rejected_items,
    p_links,
    p_type,
    p_is_stub,
    p_visibility
  )
$$;

alter function public.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) owner to postgres;

revoke all privileges on function public.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) from anon, authenticated, public;

grant execute on function public.upsert_open_data_listing(
  bigint,
  uuid,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text[],
  text[],
  text[],
  text,
  boolean,
  boolean
) to service_role;
