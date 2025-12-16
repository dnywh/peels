"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import PhotoThumbnail from "@/components/PhotoThumbnail";
import { styled } from "@pigment-css/react";

interface FeaturedListingConfig {
  slug: string;
  photos: number[];
}

interface ListingPublicData {
  slug: string;
  name: string;
  photos: string[];
  type: string;
}

interface ListingWithPhotoIndex extends ListingPublicData {
  photoIndex: number;
}

const featuredListingsForPhotos: FeaturedListingConfig[] = [
  { slug: "oLbJwGqRQrzo", photos: [0] },
  { slug: "KX5eqmXGadu2", photos: [0] },
  { slug: "NPISVZDjJYsl", photos: [0] },
  { slug: "HOaEy5gxgrvc", photos: [0] },
  { slug: "itKrzEbLPDPf", photos: [0, 2] },
  { slug: "B030fsqGqMzt", photos: [0] },
  { slug: "iFtK9KoxxID9", photos: [1] },
  { slug: "FjABURjzHDMW", photos: [0, 1] },
  { slug: "MG92x2GOAeXj", photos: [0] },
  { slug: "zUJ2ukqP4VbS", photos: [4] },
  { slug: "RbAsf8OqLrPf", photos: [0] },
  { slug: "oFvkhgiPvzGJ", photos: [3] },
  { slug: "vmobuio1RAD5", photos: [0] },
  { slug: "MJXTt4x5n9ag", photos: [0] },
  { slug: "rK1zNtjl2orh", photos: [0] },
  { slug: "GmtjmYnNeQu5", photos: [2] },
];

const MAX_PHOTOS_TO_SHOW = 3;

const PhotoRow = styled("ul")(({ theme }) => ({
  margin: "2rem 0",
  display: "flex",
  flexDirection: "row",
  gap: "0.75rem",
  justifyContent: "center",

  "& li": {
    transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    "&:first-of-type": {
      transform: "rotate(-2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(-2deg) translateY(0.5rem) scale(1.05)",
      },
    },
    "&:nth-of-type(2)": {
      transform: "scale(1)",
      "&:hover": {
        transform: "scale(1.05)",
      },
    },
    "&:last-of-type": {
      transform: "rotate(2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(2deg) translateY(0.5rem) scale(1.05)",
      },
    },
  },

  "@media (min-width: 768px)": {
    gap: "2rem",
  },
}));

function PeelsFeaturedHostsPhotos() {
  const [featuredListings, setFeaturedListings] = useState<
    ListingWithPhotoIndex[]
  >([]);
  const supabase = createClient();

  useEffect(() => {
    const loadListings = async () => {
      const { data, error } = await supabase
        .from("listings_public_data")
        .select()
        .in(
          "slug",
          featuredListingsForPhotos.map((item) => item.slug)
        )
        // Weed-out any accidental additions that don't meet our 'featured' criteria
        .neq("type", "residential")
        .neq("photos", "{}");
      // Filtering out listings with false visibility is handled at the view level

      if (error) {
        console.error("Error loading featured listings:", error);
        return;
      }

      // Filter out any listings where the photo index we've chosen no longer exists
      // Also select a random photo index
      const validListingsWithPhotos = (data as ListingPublicData[])
        .map((listing) => {
          const config = featuredListingsForPhotos.find(
            (item) => item.slug === listing.slug
          );
          // Skip if photos array is invalid or configured index doesn't exist
          if (
            !config ||
            !listing.photos ||
            !Array.isArray(listing.photos) ||
            listing.photos.length <= Math.max(...config.photos)
          ) {
            return null;
          }
          // Randomly select one of the configured photo indexes
          const randomPhotoIndex =
            config.photos[Math.floor(Math.random() * config.photos.length)];
          return { ...listing, photoIndex: randomPhotoIndex };
        })
        .filter(
          (listing): listing is ListingWithPhotoIndex => listing !== null
        );

      // Then shuffle and take the first MAX_PHOTOS_TO_SHOW
      const shuffledData = [...validListingsWithPhotos].sort(
        () => Math.random() - 0.5
      );
      setFeaturedListings(shuffledData);
    };

    loadListings();
  }, []);

  return (
    <PhotoRow>
      {featuredListings.slice(0, MAX_PHOTOS_TO_SHOW).map((listing) => {
        return (
          <PhotoThumbnail
            key={listing.slug}
            fileName={listing.photos[listing.photoIndex]}
            listingId={listing.slug}
            caption={listing.name}
          />
        );
      })}
    </PhotoRow>
  );
}

export default PeelsFeaturedHostsPhotos;
