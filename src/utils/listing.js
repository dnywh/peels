/**
 * Get the display name for a listing based on type, user auth status, and profile data
 * @param {Object} listing - The listing object containing type, name, and profiles
 * @param {Object|null} user - The current user object, or null if not authenticated
 * @returns {string} The formatted display name
 */
export function getListingDisplayName(listing, user) {
    if (!listing) return '';

    // For residential listings
    if (listing.type === "residential") {
        // Show "Private Host" to non-authenticated users
        if (!user) return "Private Host";
        // Show first name to authenticated users
        return listing.owner_first_name || "Private Host";
    }

    // For business and community listings, always show the listing name
    return listing.name || '';
}

export function getListingAvatar(listing, user) {
    if (!listing) return null;

    // For residential listings
    if (listing.type === "residential") {
        // Show private avatar to non-authenticated users
        if (!user) {
            return {
                bucket: "public",
                filename: "avatars/private.jpg",
                alt: "A blurred avatar for Private Host. Sign in to see their full information."
            };
        }

        // Show actual avatar to authenticated users
        return {
            bucket: "avatars",
            filename: listing.owner_avatar || null,
            alt: `${listing.owner_first_name}’s avatar`
        };
    }

    // For business and community listings
    return {
        bucket: "listing_avatars",
        filename: listing.avatar || null,
        alt: `${listing.name}’s avatar`
    };
}

export function getListingDisplayType(listing) {
    if (!listing) return '';

    // For residential listings
    if (listing.type === "residential") {
        // Show "Local resident" 
        return "Local resident";
    }
    // For community listings
    if (listing.type === "community") {
        return "Community spot";
    }

    // We can rely on just the listing type for business listings (and anything else that doesn't have a specific display type)
    return `Local ${listing.type}`;
}
