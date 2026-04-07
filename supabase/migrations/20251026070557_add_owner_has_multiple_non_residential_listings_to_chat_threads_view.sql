
CREATE OR REPLACE VIEW chat_threads_with_participants AS
SELECT 
    chat_threads.id,
    chat_threads.created_at,
    chat_threads.listing_id,
    chat_threads.initiator_id,
    chat_threads.owner_id,
    initiator.first_name AS initiator_first_name,
    owner.first_name AS owner_first_name,
    listings.slug AS listing_slug,
    listings.avatar AS listing_avatar,
    listings.name AS listing_name,
    listings.type AS listing_type,
    listings.area_name AS listing_area_name,
    owner.avatar AS owner_avatar,
    initiator.avatar AS initiator_avatar,
    (SELECT COUNT(*) >= 2
     FROM listings AS owner_listings
     WHERE owner_listings.owner_id = chat_threads.owner_id
     AND owner_listings.type IN ('community', 'business')
    ) AS owner_has_multiple_non_residential_listings
FROM chat_threads
    JOIN profiles initiator ON chat_threads.initiator_id = initiator.id
    JOIN profiles owner ON chat_threads.owner_id = owner.id
    JOIN listings ON chat_threads.listing_id = listings.id;
;
