import { siteConfig } from "../config/site.ts";
import { countries } from "../data/countries.ts";
import { getStoragePublicUrl } from "./storage.ts";
import { createPeelsMetadata } from "./seo.ts";
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
  links?: string[] | null;
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
  businessIntro: (values: { name: string; location?: string }) => string;
  connect: (values: { name: string; siteName: string }) => string;
  acceptedItemsLabel: string;
  rejectedItemsLabel: string;
  locationKeywords: (values: { location: string }) => string[];
  baseKeywords: () => string[];
};

type ListingDisplayNameCopy = Pick<
  ListingSeoCopy,
  "privateHostName" | "fallbackListingName"
> & {
  privateHostAvatarAlt?: string;
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

type AnonymousSensitiveListingTeaserField =
  | "name"
  | "owner_first_name"
  | "owner_avatar"
  | "avatar"
  | "description"
  | "accepted_items"
  | "rejected_items"
  | "photos"
  | "links"
  | "coordinates";

type AnonymousSensitiveListingTeaser<T extends ListingLike> = Omit<
  T,
  AnonymousSensitiveListingTeaserField
> &
  Record<AnonymousSensitiveListingTeaserField, null>;

type GenerateListingMetadataOptions = ListingSeoOptions & {
  includeFullMetadata?: boolean;
};

const defaultListingSeoCopy: ListingSeoCopy = {
  privateHostName: "Private Host",
  fallbackListingName: "Listing",
  residentialConnectName: "them",
  residentialIntro: ({ name, location }) =>
    `${name} accepts food scraps for composting${location ? ` in ${location}` : ""}.`,
  businessIntro: ({ name, location }) =>
    `${name} shares compostable material for composting${location ? ` in ${location}` : ""}.`,
  connect: ({ name, siteName }) =>
    `Connect with ${name} on ${siteName}, ${siteConfig.meta.explainer}.`,
  acceptedItemsLabel: "Accepted food scraps",
  rejectedItemsLabel: "Items not accepted",
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

function isPublicListingType(listingType: ListingType | null) {
  return listingType === "business" || listingType === "community";
}

function isSensitiveAnonymousListing(
  listingType: ListingType | null,
  user: ListingUser
) {
  return !user && !isPublicListingType(listingType);
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

function getListingItemProperties(
  listing: ListingLike,
  seoCopy: ListingSeoCopy
) {
  const acceptedItems = compactTextList(listing.accepted_items) ?? [];
  const rejectedItems = compactTextList(listing.rejected_items) ?? [];

  return [
    acceptedItems.length
      ? {
          "@type": "PropertyValue",
          name: seoCopy.acceptedItemsLabel,
          propertyID: "acceptedItems",
          value: acceptedItems.join(", "),
        }
      : null,
    rejectedItems.length
      ? {
          "@type": "PropertyValue",
          name: seoCopy.rejectedItemsLabel,
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
  seoCopy: ListingDisplayNameCopy = defaultListingSeoCopy
) {
  if (!listing) return "";

  const listingType = normaliseListingType(listing.type);

  if (isSensitiveAnonymousListing(listingType, user)) {
    return seoCopy.privateHostName;
  }

  if (listingType === "residential") {
    if (!user) return seoCopy.privateHostName;
    return listing.owner_first_name || seoCopy.privateHostName;
  }

  return listing.name || seoCopy.fallbackListingName;
}

export function getListingAvatar(
  listing: ListingLike | null | undefined,
  user: ListingUser,
  seoCopy: ListingDisplayNameCopy = defaultListingSeoCopy
): AvatarDescriptor {
  if (!listing) return null;

  const listingType = normaliseListingType(listing.type);

  if (listing.is_demo) {
    const demoAvatarFilename = listing.avatar?.split("/").pop();
    const demoListingDisplayName =
      listing.name || listing.owner_first_name || seoCopy.fallbackListingName;

    return {
      isDemo: true,
      path: `/avatars/demo/${demoAvatarFilename}`,
      alt: `${demoListingDisplayName} avatar`,
    };
  }

  const listingDisplayName = getListingDisplayName(listing, user, seoCopy);

  if (isSensitiveAnonymousListing(listingType, user)) {
    return {
      bucket: "public",
      filename: "avatars/default/private.jpg",
      alt:
        seoCopy.privateHostAvatarAlt ??
        `A blurred avatar for ${seoCopy.privateHostName}. Sign in to see their full information.`,
    };
  }

  if (listingType === "residential") {
    return {
      bucket: "avatars",
      filename: listing.owner_avatar || null,
      alt: `${listing.owner_first_name || seoCopy.privateHostName} avatar`,
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

export function getAnonymousSensitiveListingTeaser<T extends ListingLike>(
  listing: T,
  user: ListingUser
): T | AnonymousSensitiveListingTeaser<T> {
  const listingType = normaliseListingType(listing.type);

  if (!isSensitiveAnonymousListing(listingType, user)) {
    return listing;
  }

  return {
    ...listing,
    name: null,
    owner_first_name: null,
    owner_avatar: null,
    avatar: null,
    description: null,
    accepted_items: null,
    rejected_items: null,
    photos: null,
    links: null,
    coordinates: null,
  } as AnonymousSensitiveListingTeaser<T>;
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
  const isSensitiveAnonymous = isSensitiveAnonymousListing(listingType, user);
  const shouldUseResidentialIntro =
    listingType === "residential" ||
    listingType === "community" ||
    isSensitiveAnonymous;
  const shouldOmitListingDescription =
    listingType === "residential" || isSensitiveAnonymous;
  const listingFullLocation = getListingLocation(listing, options.locale);
  const listingIntro = shouldUseResidentialIntro
    ? seoCopy.residentialIntro({
        name: listingDisplayName,
        location: listingFullLocation || undefined,
      })
    : seoCopy.businessIntro({
        name: listingDisplayName,
        location: listingFullLocation || undefined,
      });
  const listingConnectName = isSensitiveAnonymous
    ? seoCopy.residentialConnectName
    : listingType === "residential"
      ? listingDisplayName
      : listing.name || listingDisplayName;
  const listingDescriptionParts = [
    listingIntro,
    shouldOmitListingDescription
      ? null
      : listing.description?.trim()
        ? listing.description.trim()
        : null,
    seoCopy.connect({
      name: listingConnectName,
      siteName: siteConfig.name,
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
  const listingFullLocation = getListingLocation(listing, options.locale);
  const listingDescription = generateListingDescription(listing, user, options);
  const listingCanonicalPath = getListingCanonicalPath(listing);

  const metadata: Metadata = createPeelsMetadata({
    title: listingDisplayName,
    description: listingDescription,
    canonicalPath: listingCanonicalPath || undefined,
    openGraph: {
      title: listingDisplayName,
      description: listingDescription,
      siteName: siteConfig.name,
    },
    twitter: {
      title: listingDisplayName,
      description: listingDescription,
    },
  });

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
    ? getListingItemProperties(listing, seoCopy)
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
