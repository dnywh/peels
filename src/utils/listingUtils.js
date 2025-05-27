import { siteConfig } from "@/config/site";
import { countries } from "@/data/countries";

/**
 * Get the display name for a listing based on type, user auth status, and profile data
 * @param {Object} listing - The listing object containing type, name, and profiles
 * @param {Object|null} user - The current user object, or null if not authenticated
 * @returns {string} The formatted display name
 */
export function getListingDisplayName(listing, user) {
  if (!listing) return "";

  // For residential listings
  if (listing.type === "residential") {
    // Show "Private Host" to non-authenticated users
    if (!user) return "Private Host";
    // Show first name to authenticated users
    return listing.owner_first_name || "Private Host";
  }

  // For business and community listings, always show the listing name
  return listing.name || "";
}

export function getListingAvatar(listing, user) {
  if (!listing) return null;

  // For demo listings, return path to public demo folder
  if (listing?.is_demo) {
    return {
      isDemo: true, // New flag to indicate demo image
      path: `/avatars/demo/${listing?.avatar}`,
      alt: `${listing?.name}’s avatar`,
    };
  }

  // For residential listings
  if (listing.type === "residential") {
    // Show private avatar to non-authenticated users
    if (!user) {
      return {
        bucket: "public",
        filename: "avatars/default/private.jpg",
        alt: "A blurred avatar for Private Host. Sign in to see their full information.",
      };
    }

    // Show actual avatar to authenticated users
    return {
      bucket: "avatars",
      filename: listing.owner_avatar || null,
      alt: `${listing.owner_first_name}’s avatar`,
    };
  }

  // Business and community listings
  // For those without an avatar, use a default image based on the listing type
  if (!listing.avatar) {
    return {
      path: `/avatars/default/${listing.type}.png`,
      alt: `${listing.name}’s avatar`,
    };
  }

  // Otherwise, if that business or community listing has an avatar, use it!
  return {
    bucket: "listing_avatars",
    filename: listing.avatar || null,
    alt: `${listing.name}’s avatar`,
  };
}

// TODO: Should this be merged in the above getListingAvatar, since we already do the same thing for the owner avatar?
export function getListingOwnerAvatar(listing) {
  if (!listing) return null;

  return {
    bucket: "avatars",
    filename: listing.owner_avatar || null,
    alt: `${listing.owner_first_name}’s avatar`,
  };
}

export function getProfileAvatar(profileId) {
  if (!profileId) return null;

  return {
    bucket: "avatars",
    filename: profileId,
    alt: "The avatar for this profile",
  };
}

export function getListingDisplayType(listing) {
  if (!listing) return "";

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

export function generateListingMetadata(listing, user, options = {}) {
  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  const listingDisplayName = getListingDisplayName(listing, user);
  const listingCountryName = countries.find(
    (country) => country.code === listing.country_code
  )?.name;
  const listingFullLocation = `${listing.area_name}, ${listingCountryName}`;
  const listingDescription = `${listingDisplayName} is ${listing.type === "residential" ? "" : ` a ${listing.type}`} based in ${listingFullLocation}. ${listing.type === "residential" ? "" : `${listing.description}`} Connect with ${listing.type === "residential" ? "them" : `${listing.name}`} on ${siteConfig.name}, ${siteConfig.meta.explainer}.`;

  const metadata = {
    title: listingDisplayName,
    openGraph: {
      title: listingDisplayName,
      description: listingDescription,
      siteName: siteConfig.name,
    },
  };

  // Only include these fields for the full listing page
  if (options.includeFullMetadata) {
    metadata.description = listingDescription;
    metadata.keywords = [
      listingFullLocation,
      `food scraps in ${listing.area_name} ${listingCountryName}`, // Not using ${listingFullLocation} as it has a comma, thus creating a new item in the array
      `compost ${listing.area_name} ${listingCountryName}`,
      `food scrap drop-off ${listing.area_name} ${listingCountryName}`,
      `compost drop-off ${listing.area_name} ${listingCountryName}`,
      ...siteConfig.meta.keywords,
    ];
  }

  return metadata;
}
