"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import PhotoThumbnail from "@/components/PhotoThumbnail";
import { styled } from "next-yak";

interface ListingPublicData {
  slug: string;
  name: string;
  photos: string[] | null;
  type: string;
  is_stub: boolean | null;
  homepage_featured: boolean;
  homepage_featured_photo_indexes: number[] | null;
}

interface ListingWithPhotoIndex extends ListingPublicData {
  photoIndex: number;
  photos: string[];
}

const MAX_PHOTOS_TO_SHOW = 3;

function selectHomepagePhotoIndex(listing: ListingPublicData): number | null {
  if (!Array.isArray(listing.photos) || listing.photos.length === 0) {
    return null;
  }

  const photos = listing.photos;
  const configuredIndexes = listing.homepage_featured_photo_indexes ?? [];

  if (configuredIndexes.length > 0) {
    const validConfiguredIndexes = configuredIndexes.filter(
      (index) => Number.isInteger(index) && index >= 0 && index < photos.length
    );

    if (validConfiguredIndexes.length === 0) {
      return null;
    }

    return validConfiguredIndexes[
      Math.floor(Math.random() * validConfiguredIndexes.length)
    ];
  }

  return Math.floor(Math.random() * photos.length);
}

const PhotoRow = styled.ul`
  margin: 2rem 0;
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  justify-content: center;
  & li {
    transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    &:first-of-type {
      transform: rotate(-2deg) translateY(0.5rem) scale(1);
      &:hover {
        transform: rotate(-2deg) translateY(0.5rem) scale(1.05);
      }
    }
    &:nth-of-type(2) {
      transform: scale(1);
      &:hover {
        transform: scale(1.05);
      }
    }
    &:last-of-type {
      transform: rotate(2deg) translateY(0.5rem) scale(1);
      &:hover {
        transform: rotate(2deg) translateY(0.5rem) scale(1.05);
      }
    }
  }
  @media (min-width: 768px) {
    gap: 2rem;
  }
`;

function PeelsFeaturedHostsPhotos() {
  const [featuredListings, setFeaturedListings] = useState<
    ListingWithPhotoIndex[]
  >([]);
  const supabase = createClient();

  useEffect(() => {
    const loadListings = async () => {
      const { data, error } = await supabase
        .from("listings_public_data")
        .select(
          "slug, name, photos, type, is_stub, homepage_featured, homepage_featured_photo_indexes"
        )
        .eq("homepage_featured", true)
        .eq("is_stub", false)
        .neq("type", "residential")
        .not("photos", "is", null);

      if (error) {
        console.error("Error loading featured listings:", error);
        return;
      }

      const validListingsWithPhotos = (data as ListingPublicData[])
        .map((listing) => {
          const photoIndex = selectHomepagePhotoIndex(listing);

          if (!Array.isArray(listing.photos) || photoIndex === null) {
            return null;
          }

          return {
            ...listing,
            photos: listing.photos,
            photoIndex,
          };
        })
        .filter(
          (listing): listing is ListingWithPhotoIndex => listing !== null
        );

      const shuffledData = [...validListingsWithPhotos].sort(
        () => Math.random() - 0.5
      );
      setFeaturedListings(shuffledData);
    };

    loadListings();
  }, []);

  return (
    <PhotoRow data-testid="homepage-featured-hosts">
      {featuredListings.slice(0, MAX_PHOTOS_TO_SHOW).map((listing) => {
        return (
          <PhotoThumbnail
            key={listing.slug}
            fileName={listing.photos[listing.photoIndex]}
            listingId={listing.slug}
            caption={listing.name}
            testId={`homepage-featured-host-${listing.slug}`}
          />
        );
      })}
    </PhotoRow>
  );
}

export default PeelsFeaturedHostsPhotos;
