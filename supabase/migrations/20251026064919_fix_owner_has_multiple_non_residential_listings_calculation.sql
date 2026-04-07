
-- Fix and update the listings_public_data view
CREATE OR REPLACE VIEW listings_public_data AS
SELECT 
    id,
    created_at,
    name,
    description,
    location,
    accepted_items,
    rejected_items,
    CASE
        WHEN type = ANY (ARRAY['business'::text, 'community'::text]) THEN photos
        ELSE NULL::text[]
    END AS photos,
    links,
    type,
    avatar,
    slug,
    latitude,
    longitude,
    country_code,
    area_name,
    is_stub,
    (SELECT COUNT(*) >= 2
     FROM listings AS other_listings
     WHERE other_listings.owner_id = listings.owner_id
     AND other_listings.type IN ('community', 'business')
    ) AS owner_has_multiple_non_residential_listings
FROM listings
WHERE visibility = true;

-- Fix and update the listings_private_data view
CREATE OR REPLACE VIEW listings_private_data AS
SELECT 
    listings.id,
    listings.owner_id,
    listings.name,
    listings.description,
    listings.location,
    listings.accepted_items,
    listings.rejected_items,
    listings.photos,
    listings.links,
    listings.visibility,
    listings.type,
    listings.avatar,
    listings.slug,
    listings.latitude,
    listings.longitude,
    listings.country_code,
    listings.area_name,
    listings.is_stub,
    profiles.first_name AS owner_first_name,
    profiles.avatar AS owner_avatar,
    (SELECT COUNT(*) >= 2
     FROM listings AS owner_listings
     WHERE owner_listings.owner_id = listings.owner_id
     AND owner_listings.type IN ('community', 'business')
    ) AS owner_has_multiple_non_residential_listings
FROM listings
LEFT JOIN profiles ON listings.owner_id = profiles.id;
;
