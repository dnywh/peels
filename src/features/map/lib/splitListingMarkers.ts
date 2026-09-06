import type { Feature, FeatureCollection, Point } from "geojson";

import type { ListingMarker } from "@/types/listing";

import { hasValidCoordinates } from "./mapUtils.ts";

export type SplitListingMarkersResult = {
  organic: ListingMarker[];
  mirrored: ListingMarker[];
};

export function splitListingMarkers(
  listings: ListingMarker[]
): SplitListingMarkersResult {
  const organic: ListingMarker[] = [];
  const mirrored: ListingMarker[] = [];

  for (const listing of listings) {
    if (!hasValidCoordinates(listing)) continue;

    if (listing.is_open_data_mirrored) {
      mirrored.push(listing);
    } else {
      organic.push(listing);
    }
  }

  return { organic, mirrored };
}

export function mirroredListingsToGeoJson(
  listings: ListingMarker[]
): FeatureCollection<Point> {
  const features: Feature<Point>[] = [];

  for (const listing of listings) {
    if (!hasValidCoordinates(listing)) continue;

    const coordinates = listing.coordinates!;
    features.push({
      type: "Feature",
      id: listing.id,
      properties: {
        id: listing.id,
        slug: listing.slug,
        type: listing.type,
      },
      geometry: {
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude],
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function excludeListingById(
  listings: ListingMarker[],
  listingId: number | null
): ListingMarker[] {
  if (listingId === null) return listings;
  return listings.filter((listing) => listing.id !== listingId);
}

export function findListingMarkerById(
  listings: ListingMarker[],
  listingId: number | null
): ListingMarker | null {
  if (listingId === null) return null;
  return listings.find((listing) => listing.id === listingId) ?? null;
}

export function resolveOrganicPinListings(
  organic: ListingMarker[],
  selectedListing: ListingMarker | null,
  selectedMirroredListingId: number | null
): ListingMarker[] {
  if (
    selectedMirroredListingId === null ||
    selectedListing === null ||
    selectedListing.id !== selectedMirroredListingId
  ) {
    return organic;
  }

  return [...organic, selectedListing];
}
