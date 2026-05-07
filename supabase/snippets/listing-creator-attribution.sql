-- Listing creator attribution report.
-- Run this in the Supabase SQL editor. Attribution is first-touch signup data
-- stored on profiles, joined to people who have created listings.

with listing_creators as (
  select
    listings.owner_id,
    max(listings.created_at) as latest_listing_created_at,
    array_remove(
      array_agg(listings.slug order by listings.created_at desc, listings.slug),
      null
    ) as listing_slugs
  from public.listings
  where listings.owner_id is not null
  group by listings.owner_id
),
attributed_listing_creators as (
  select
    listing_creators.*,
    nullif(lower(btrim(profiles.utm_source)), '') as utm_source,
    case
      when profiles.http_referrer ~* '^https?://'
        then nullif(
          regexp_replace(
            lower(
              regexp_replace(
                split_part(
                  regexp_replace(profiles.http_referrer, '^https?://', '', 'i'),
                  '/',
                  1
                ),
                ':\d+$',
                ''
              )
            ),
            '^www\.',
            ''
          ),
          ''
        )
      else null
    end as referrer_hostname
  from listing_creators
  left join public.profiles
    on profiles.id = listing_creators.owner_id
)
select
  coalesce(
    utm_source,
    referrer_hostname,
    'direct / unknown'
  ) as source,
  listing_slugs
from attributed_listing_creators
order by latest_listing_created_at desc
limit 100;
