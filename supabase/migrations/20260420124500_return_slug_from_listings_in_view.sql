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
