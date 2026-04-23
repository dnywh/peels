import { siteConfig } from "@/config/site";
import { countries } from "@/data/countries";
import type { Metadata } from "next";
import type { DemoListing, Listing, ListingType } from "@/types/listing";

type ListingLike = {
  type?: ListingType | string | null;
  name?: string | null;
  owner_first_name?: string | null;
  owner_avatar?: string | null;
  avatar?: string | null;
  is_demo?: boolean;
  country_code?: string | null;
  area_name?: string | null;
  description?: string | null;
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
  const listingType = normaliseListingType(listing.type);
  const listingCountryName = countries.find(
    (country) => country.code === listing.country_code
  )?.name;
  const listingLocationParts = compactTextParts([
    listing.area_name,
    listingCountryName,
  ]);
  const listingFullLocation = listingLocationParts.join(", ");
  const listingBaseDescriptor =
    listingType === "residential"
      ? `${listingDisplayName} is a local resident`
      : listingType
        ? `${listingDisplayName} is a ${listingType}`
        : `${listingDisplayName} is a local listing`;
  const listingDescriptionParts = [
    listingBaseDescriptor,
    listingFullLocation ? `based in ${listingFullLocation}.` : null,
    listingType === "residential"
      ? null
      : listing.description?.trim()
        ? `${listing.description.trim()}`
        : null,
    `Connect with ${
      listingType === "residential"
        ? "them"
        : listing.name || listingDisplayName
    } on ${siteConfig.name}, ${siteConfig.meta.explainer}.`,
  ];
  const listingDescription = compactTextParts(listingDescriptionParts).join(
    " "
  );

  const metadata: Metadata = {
    title: listingDisplayName,
    openGraph: {
      title: listingDisplayName,
      description: listingDescription,
      siteName: siteConfig.name,
    },
  };

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

    metadata.description = listingDescription;
    metadata.keywords = [...locationKeywords, ...siteConfig.meta.keywords];
  }

  return metadata;
}
