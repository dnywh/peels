alter table public.listings
  add column homepage_featured boolean not null default false,
  add column homepage_featured_photo_indexes integer[] not null default '{}'::integer[];

update public.listings
set
  homepage_featured = true,
  homepage_featured_photo_indexes = case slug
    when 'oLbJwGqRQrzo' then array[0]
    when 'KX5eqmXGadu2' then array[0]
    when 'NPISVZDjJYsl' then array[0]
    when 'HOaEy5gxgrvc' then array[0]
    when 'itKrzEbLPDPf' then array[0, 2]
    when 'B030fsqGqMzt' then array[0]
    when 'iFtK9KoxxID9' then array[1]
    when 'FjABURjzHDMW' then array[0, 1]
    when 'MG92x2GOAeXj' then array[0]
    when 'zUJ2ukqP4VbS' then array[4]
    when 'RbAsf8OqLrPf' then array[0]
    when 'oFvkhgiPvzGJ' then array[3]
    when 'vmobuio1RAD5' then array[0]
    when 'MJXTt4x5n9ag' then array[0]
    when 'rK1zNtjl2orh' then array[0]
    when 'GmtjmYnNeQu5' then array[2]
  end
where slug in (
  'oLbJwGqRQrzo',
  'KX5eqmXGadu2',
  'NPISVZDjJYsl',
  'HOaEy5gxgrvc',
  'itKrzEbLPDPf',
  'B030fsqGqMzt',
  'iFtK9KoxxID9',
  'FjABURjzHDMW',
  'MG92x2GOAeXj',
  'zUJ2ukqP4VbS',
  'RbAsf8OqLrPf',
  'oFvkhgiPvzGJ',
  'vmobuio1RAD5',
  'MJXTt4x5n9ag',
  'rK1zNtjl2orh',
  'GmtjmYnNeQu5'
);

create or replace view public.listings_private_data with (security_invoker = 'on') as
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
  (
    select count(*) >= 2
    from public.listings as owner_listings
    where owner_listings.owner_id = listings.owner_id
      and owner_listings.type in ('community', 'business')
  ) as owner_has_multiple_non_residential_listings,
  listings.homepage_featured,
  listings.homepage_featured_photo_indexes
from public.listings
left join public.profiles on listings.owner_id = profiles.id;

alter view public.listings_private_data owner to postgres;

create or replace view public.listings_public_data with (security_invoker = 'on') as
select
  id,
  created_at,
  name,
  description,
  accepted_items,
  rejected_items,
  case
    when type = any (array['business'::text, 'community'::text]) then photos
    else null::text[]
  end as photos,
  links,
  type,
  avatar,
  slug,
  jsonb_build_object(
    'latitude', extensions.st_y(location::extensions.geometry),
    'longitude', extensions.st_x(location::extensions.geometry)
  ) as coordinates,
  country_code,
  area_name,
  is_stub,
  (
    select count(*) >= 2
    from public.listings as other_listings
    where other_listings.owner_id = listings.owner_id
      and other_listings.type in ('community', 'business')
  ) as owner_has_multiple_non_residential_listings,
  homepage_featured,
  homepage_featured_photo_indexes
from public.listings
where visibility = true;

alter view public.listings_public_data owner to postgres;
