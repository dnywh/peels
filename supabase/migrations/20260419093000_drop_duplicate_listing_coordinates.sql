do $$
begin
  if exists (
    select 1
    from public.listings
    where abs(latitude - extensions.st_y(location::extensions.geometry)) > 0.0000001
       or abs(longitude - extensions.st_x(location::extensions.geometry)) > 0.0000001
  ) then
    raise exception 'Cannot drop listings.latitude/listings.longitude because at least one row does not match listings.location.';
  end if;
end
$$;

drop function if exists public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
);

drop view if exists public.listings_public_data;
drop view if exists public.listings_private_data;

alter table public.listings
  alter column location type extensions.geography(Point, 4326)
  using extensions.st_setsrid(location::extensions.geometry, 4326)::extensions.geography(Point, 4326);

alter table public.listings
  drop column latitude,
  drop column longitude;

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
  ) as owner_has_multiple_non_residential_listings
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
  ) as owner_has_multiple_non_residential_listings
from public.listings
where visibility = true;

alter view public.listings_public_data owner to postgres;

create or replace function public.listings_in_view(
  min_lat double precision,
  min_long double precision,
  max_lat double precision,
  max_long double precision
) returns table(id bigint, slug text, type text, coordinates jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select
    listings.id,
    listings.slug,
    listings.type,
    jsonb_build_object(
      'latitude', extensions.st_y(listings.location::extensions.geometry),
      'longitude', extensions.st_x(listings.location::extensions.geometry)
    ) as coordinates
  from public.listings
  where listings.visibility = true
    and listings.location OPERATOR(extensions.&&) extensions.st_makeenvelope(
      min_long,
      min_lat,
      max_long,
      max_lat,
      4326
    )::extensions.geography;
end;
$$;

alter function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) owner to postgres;

grant all on function public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
) to anon, authenticated, service_role;

revoke all on table public.listings_private_data
  from anon, authenticated, service_role;

revoke all on table public.listings_public_data
  from anon, authenticated, service_role;

grant select on table public.listings_private_data
  to authenticated, service_role;

grant select on table public.listings_public_data
  to anon, authenticated, service_role;
