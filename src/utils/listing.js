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
        return listing.profiles?.first_name || "Private Host";
    }

    // For business and community listings, always show the listing name
    return listing.name || '';
}


export function getListingDisplayType(listing) {
    if (!listing) return '';

    // For residential listings
    if (listing.type === "residential") {
        // Show "Local resident" 
        return "Local resident";
    }

    // We can rely on just the listing type for business and community listings
    return `Local ${listing.type}`;
}
