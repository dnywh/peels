import { siteConfig } from "../config/site.ts";
import { countries } from "../data/countries.ts";
import { getStoragePublicUrl } from "./storage.ts";
import type { Metadata } from "next";
import type { ListingCoordinates, ListingType } from "../types/listing.ts";

type ListingLike = {
  type?: ListingType | string | null;
  name?: string | null;
  owner_first_name?: string | null;
  owner_avatar?: string | null;
  avatar?: string | null;
  is_demo?: boolean;
  slug?: string | null;
  country_code?: string | null;
  area_name?: string | null;
  description?: string | null;
  photos?: string[] | null;
  coordinates?: ListingCoordinates | null;
};

type ListingUser =
  | {
      id?: string | null;
    }
  | null
  | undefined;

type AvatarDescriptor = {
  isDemo?: boolean;
  path?: string;
  bucket?: string;
  filename?: string | null;
  alt: string;
} | null;

type GenerateListingMetadataOptions = {
  includeFullMetadata?: boolean;
};

function normaliseListingType(
  listingType: ListingLike["type"]
): ListingType | null {
  if (
    listingType === "business" ||
    listingType === "community" ||
    listingType === "residential"
  ) {
    return listingType;
  }

  return null;
}

function compactTextParts(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

function getListingCountryName(listing: ListingLike | null | undefined) {
  return countries.find((country) => country.code === listing?.country_code)
    ?.name;
}

function getListingLocation(listing: ListingLike | null | undefined) {
  const listingCountryName = getListingCountryName(listing);

  return compactTextParts([listing?.area_name, listingCountryName]).join(", ");
}

function getListingCanonicalPath(listing: ListingLike) {
  if (!listing.slug) return null;

  return `/listings/${encodeURIComponent(listing.slug)}`;
}

function getListingStructuredDataImage(
  listing: ListingLike,
  user: ListingUser
) {
  if (normaliseListingType(listing.type) === "residential") {
    return null;
  }

  const firstPhoto = listing.photos?.[0];
  if (firstPhoto) {
    return getStoragePublicUrl("listing_photos", firstPhoto);
  }

  const avatar = getListingAvatar(listing, user);

  if (avatar?.path) {
    return new URL(avatar.path, siteConfig.url).toString();
  }

  if (avatar?.bucket && avatar.filename) {
    return getStoragePublicUrl(avatar.bucket, avatar.filename);
  }

  return null;
}

export function getListingDisplayName(
  listing: ListingLike | null | undefined,
  user: ListingUser
) {
  if (!listing) return "";

  const listingType = normaliseListingType(listing.type);

  if (listingType === "residential") {
    if (!user) return "Private Host";
    return listing.owner_first_name || "Private Host";
  }

  return listing.name || "Listing";
}

export function getListingAvatar(
  listing: ListingLike | null | undefined,
  user: ListingUser
): AvatarDescriptor {
  if (!listing) return null;

  const listingType = normaliseListingType(listing.type);
  const listingDisplayName = getListingDisplayName(listing, user);

  if (listing.is_demo) {
    const demoAvatarFilename = listing.avatar?.split("/").pop();

    return {
      isDemo: true,
      path: `/avatars/demo/${demoAvatarFilename}`,
      alt: `${listingDisplayName} avatar`,
    };
  }

  if (listingType === "residential") {
    if (!user) {
      return {
        bucket: "public",
        filename: "avatars/default/private.jpg",
        alt: "A blurred avatar for Private Host. Sign in to see their full information.",
      };
    }

    return {
      bucket: "avatars",
      filename: listing.owner_avatar || null,
      alt: `${listing.owner_first_name || "Private Host"} avatar`,
    };
  }

  if (!listing.avatar) {
    return {
      path: `/avatars/default/${listingType || "community"}.png`,
      alt: `${listingDisplayName} avatar`,
    };
  }

  return {
    bucket: "listing_avatars",
    filename: listing.avatar || null,
    alt: `${listingDisplayName} avatar`,
  };
}

export function getListingOwnerAvatar(
  listing: ListingLike | null | undefined
): AvatarDescriptor {
  if (!listing) return null;

  return {
    bucket: "avatars",
    filename: listing.owner_avatar || null,
    alt: `${listing.owner_first_name || "Listing owner"} avatar`,
  };
}

export function getProfileAvatarSource(
  avatarFilename: string | null | undefined
) {
  if (!avatarFilename) return null;

  return {
    bucket: "avatars",
    filename: avatarFilename,
    alt: "The avatar for this profile",
  };
}

export function getListingDisplayType(listing: ListingLike | null | undefined) {
  if (!listing) return "";

  const listingType = normaliseListingType(listing.type);

  if (listingType === "residential") {
    return "Local resident";
  }

  if (listingType === "community") {
    return "Community spot";
  }

  if (listingType === "business") {
    return "Local business";
  }

  return "Local listing";
}

export function generateListingDescription(
  listing: ListingLike | null | undefined,
  user: ListingUser
) {
  if (!listing) return "";

  const listingDisplayName = getListingDisplayName(listing, user);
  const listingType = normaliseListingType(listing.type);
  const listingFullLocation = getListingLocation(listing);
  const listingIntro =
    listingType === "residential"
      ? `${listingDisplayName} accepts food scraps for composting`
      : `${listingDisplayName} helps people compost food scraps`;
  const listingLocationSuffix = listingFullLocation
    ? ` in ${listingFullLocation}.`
    : ".";
  const listingDescriptionParts = [
    `${listingIntro}${listingLocationSuffix}`,
    listingType === "residential"
      ? null
      : listing.description?.trim()
        ? listing.description.trim()
        : null,
    `Connect with ${
      listingType === "residential"
        ? "them"
        : listing.name || listingDisplayName
    } on ${siteConfig.name}, ${siteConfig.meta.explainer}.`,
  ];

  return compactTextParts(listingDescriptionParts).join(" ");
}

export function generateListingMetadata(
  listing: ListingLike | null | undefined,
  user: ListingUser,
  options: GenerateListingMetadataOptions = {}
): Metadata {
  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  const listingDisplayName = getListingDisplayName(listing, user);
  const listingFullLocation = getListingLocation(listing);
  const listingDescription = generateListingDescription(listing, user);
  const listingCanonicalPath = getListingCanonicalPath(listing);

  const metadata: Metadata = {
    title: {
      absolute: listingDisplayName,
    },
    description: listingDescription,
    openGraph: {
      title: listingDisplayName,
      description: listingDescription,
      siteName: siteConfig.name,
    },
  };

  if (listingCanonicalPath) {
    metadata.alternates = {
      canonical: listingCanonicalPath,
    };
  }

  if (options.includeFullMetadata) {
    const locationKeywords = listingFullLocation
      ? [
          listingFullLocation,
          `food scraps in ${listingFullLocation}`,
          `compost ${listingFullLocation}`,
          `food scrap drop-off ${listingFullLocation}`,
          `compost drop-off ${listingFullLocation}`,
        ]
      : [];

    metadata.keywords = [...locationKeywords, ...siteConfig.meta.keywords];
  }

  return metadata;
}

export function generateListingJsonLd(
  listing: ListingLike | null | undefined,
  user: ListingUser
) {
  if (!listing?.slug) return null;

  const listingDisplayName = getListingDisplayName(listing, user);
  const listingDescription = generateListingDescription(listing, user);
  const listingType = normaliseListingType(listing.type);
  const listingCountryName = getListingCountryName(listing);
  const listingCanonicalUrl = new URL(
    `/listings/${encodeURIComponent(listing.slug)}`,
    siteConfig.url
  ).toString();
  const structuredDataImage = getListingStructuredDataImage(listing, user);
  const canIncludeStructuredLocation = listingType !== "residential" || !!user;
  const address = {
    "@type": "PostalAddress",
    ...(listing.area_name ? { addressLocality: listing.area_name } : {}),
    ...(listingCountryName ? { addressCountry: listingCountryName } : {}),
  };
  const place = {
    "@type": "Place",
    name: listingDisplayName,
    description: listingDescription,
    ...(canIncludeStructuredLocation && Object.keys(address).length > 1
      ? { address }
      : {}),
    ...(canIncludeStructuredLocation && listing.coordinates
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.coordinates.latitude,
            longitude: listing.coordinates.longitude,
          },
        }
      : {}),
    ...(structuredDataImage ? { image: structuredDataImage } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${listingCanonicalUrl}#webpage`,
    url: listingCanonicalUrl,
    name: listingDisplayName,
    description: listingDescription,
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: place,
  };
}
