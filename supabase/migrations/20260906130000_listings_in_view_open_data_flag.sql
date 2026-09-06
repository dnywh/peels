drop function if exists public.listings_in_view(
  double precision,
  double precision,
  double precision,
  double precision
);

create or replace function public.listings_in_view(
  min_lat double precision,
  min_long double precision,
  max_lat double precision,
  max_long double precision
) returns table(
  id bigint,
  slug text,
  type text,
  coordinates jsonb,
  is_open_data_mirrored boolean
)
language sql
security invoker
stable
set search_path = ''
as $$
  select
    public_listings.id,
    public_listings.slug,
    public_listings.type,
    public_listings.coordinates,
    public_listings.is_open_data_mirrored
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
