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
  accepted_items?: string[] | null;
  rejected_items?: string[] | null;
  photos?: string[] | null;
  coordinates?: ListingCoordinates | null;
};

type ListingUser =
  | {
      id?: string | null;
    }
  | null
  | undefined;

export type ListingSeoCopy = {
  privateHostName: string;
  fallbackListingName: string;
  residentialConnectName: string;
  residentialIntro: (values: { name: string; location?: string }) => string;
  nonResidentialIntro: (values: { name: string; location?: string }) => string;
  connect: (values: {
    name: string;
    siteName: string;
    explainer: string;
  }) => string;
  locationKeywords: (values: { location: string }) => string[];
  baseKeywords: () => string[];
};

type ListingSeoOptions = {
  locale?: string;
  seoCopy?: ListingSeoCopy;
};

type AvatarDescriptor = {
  isDemo?: boolean;
  path?: string;
  bucket?: string;
  filename?: string | null;
  alt: string;
} | null;

type GenerateListingMetadataOptions = ListingSeoOptions & {
  includeFullMetadata?: boolean;
};

const defaultListingSeoCopy: ListingSeoCopy = {
  privateHostName: "Private Host",
  fallbackListingName: "Listing",
  residentialConnectName: "them",
  residentialIntro: ({ name, location }) =>
    `${name} accepts food scraps for composting${location ? ` in ${location}` : ""}.`,
  nonResidentialIntro: ({ name, location }) =>
    `${name} helps people compost food scraps${location ? ` in ${location}` : ""}.`,
  connect: ({ name, siteName, explainer }) =>
    `Connect with ${name} on ${siteName}, ${explainer}.`,
  locationKeywords: ({ location }) => [
    location,
    `food scraps in ${location}`,
    `compost ${location}`,
    `food scrap drop-off ${location}`,
    `compost drop-off ${location}`,
  ],
  baseKeywords: () => [...siteConfig.meta.keywords],
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

function compactTextList(items: string[] | null | undefined) {
  return items
    ?.map((item) => item.trim())
    .filter((item): item is string => Boolean(item));
}

function getListingItemProperties(listing: ListingLike) {
  const acceptedItems = compactTextList(listing.accepted_items) ?? [];
  const rejectedItems = compactTextList(listing.rejected_items) ?? [];

  return [
    acceptedItems.length
      ? {
          "@type": "PropertyValue",
          name: "Accepted food scraps",
          propertyID: "acceptedItems",
          value: acceptedItems.join(", "),
        }
      : null,
    rejectedItems.length
      ? {
          "@type": "PropertyValue",
          name: "Items not accepted",
          propertyID: "rejectedItems",
          value: rejectedItems.join(", "),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function getListingCountryName(
  listing: ListingLike | null | undefined,
  locale?: string
) {
  if (listing?.country_code && locale) {
    try {
      const countryDisplayName = new Intl.DisplayNames([locale], {
        type: "region",
      }).of(listing.country_code);

      if (countryDisplayName) {
        return countryDisplayName;
      }
    } catch {
      // Fall back to the static English country list below.
    }
  }

  return countries.find((country) => country.code === listing?.country_code)
    ?.name;
}

function getListingLocation(
  listing: ListingLike | null | undefined,
  locale?: string
) {
  const listingCountryName = getListingCountryName(listing, locale);

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
  user: ListingUser,
  seoCopy: ListingSeoCopy = defaultListingSeoCopy
) {
  if (!listing) return "";

  const listingType = normaliseListingType(listing.type);

  if (listingType === "residential") {
    if (!user) return seoCopy.privateHostName;
    return listing.owner_first_name || seoCopy.privateHostName;
  }

  return listing.name || seoCopy.fallbackListingName;
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
  user: ListingUser,
  options: ListingSeoOptions = {}
) {
  if (!listing) return "";

  const seoCopy = options.seoCopy ?? defaultListingSeoCopy;
  const listingDisplayName = getListingDisplayName(listing, user, seoCopy);
  const listingType = normaliseListingType(listing.type);
  const listingFullLocation = getListingLocation(listing, options.locale);
  const listingIntro =
    listingType === "residential"
      ? seoCopy.residentialIntro({
          name: listingDisplayName,
          location: listingFullLocation || undefined,
        })
      : seoCopy.nonResidentialIntro({
          name: listingDisplayName,
          location: listingFullLocation || undefined,
        });
  const listingConnectName =
    listingType === "residential" && !user
      ? seoCopy.residentialConnectName
      : listing.name || listingDisplayName;
  const listingDescriptionParts = [
    listingIntro,
    listingType === "residential"
      ? null
      : listing.description?.trim()
        ? listing.description.trim()
        : null,
    seoCopy.connect({
      name: listingConnectName,
      siteName: siteConfig.name,
      explainer: siteConfig.meta.explainer,
    }),
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

  const seoCopy = options.seoCopy ?? defaultListingSeoCopy;
  const listingDisplayName = getListingDisplayName(listing, user, seoCopy);
  const listingType = normaliseListingType(listing.type);
  const listingFullLocation = getListingLocation(listing, options.locale);
  const listingDescription = generateListingDescription(listing, user, options);
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

  if (listingType === "residential") {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  if (listingCanonicalPath) {
    metadata.alternates = {
      canonical: listingCanonicalPath,
    };
  }

  if (options.includeFullMetadata) {
    const locationKeywords = listingFullLocation
      ? seoCopy.locationKeywords({ location: listingFullLocation })
      : [];

    metadata.keywords = [...locationKeywords, ...seoCopy.baseKeywords()];
  }

  return metadata;
}

export function generateListingJsonLd(
  listing: ListingLike | null | undefined,
  user: ListingUser,
  options: ListingSeoOptions = {}
) {
  if (!listing?.slug) return null;

  const seoCopy = options.seoCopy ?? defaultListingSeoCopy;
  const listingDisplayName = getListingDisplayName(listing, user, seoCopy);
  const listingDescription = generateListingDescription(listing, user, options);
  const listingType = normaliseListingType(listing.type);
  const listingCountryName = getListingCountryName(listing, options.locale);
  const listingCanonicalUrl = new URL(
    `/listings/${encodeURIComponent(listing.slug)}`,
    siteConfig.url
  ).toString();
  const canIncludePublicStructuredDetails =
    listingType === "business" || listingType === "community";
  const canIncludeStructuredLocation =
    canIncludePublicStructuredDetails || !!user;
  const structuredDataImage = canIncludePublicStructuredDetails
    ? getListingStructuredDataImage(listing, user)
    : null;
  const itemProperties = canIncludePublicStructuredDetails
    ? getListingItemProperties(listing)
    : [];
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
    ...(itemProperties.length ? { additionalProperty: itemProperties } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${listingCanonicalUrl}#webpage`,
    url: listingCanonicalUrl,
    name: listingDisplayName,
    description: listingDescription,
    ...(options.locale ? { inLanguage: options.locale } : {}),
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: place,
  };
}
