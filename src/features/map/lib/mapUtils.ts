import type { LngLatBounds } from "maplibre-gl";

import {
  isListingError,
  type Listing,
  type ListingCoordinates,
  type ListingMarker,
  type SelectedListing,
} from "@/types/listing";

export type BoundingBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

// Default coordinates for Brisbane, Australia
export const DEFAULT_COORDINATES: ListingCoordinates & { zoom: number } = {
  latitude: -27.4683,
  longitude: 153.0322,
  zoom: 9,
};

export const ZOOM_LEVEL_DEFAULT = 11;
export const ZOOM_LEVEL_SELECTED = 14;

// Durations (ms) for the different fly-to flows
export const FLY_DURATION = {
  jump: 0,
  urlSelection: 900,
  returnToListing: 1500,
  searchPick: 3200,
} as const;

// Shared sidebar width used by both the desktop layout and the map padding
// calculations so the map always accounts for the covered viewport area.
export const SIDEBAR_WIDTH = "clamp(20rem, 30vw, 30rem)";

// Snap points for the mobile listing drawer. 0.35 gives enough room for the
// listing header/CTA while keeping the map visible; 1 is the fully expanded
// state.
export const SNAP_POINTS = {
  partial: 0.35,
  full: 1,
} as const;

// `Listing` and `ListingMarker` both carry a nullable `coordinates` field.
// `SelectedListing` can additionally be a `ListingError` sentinel, which has
// no coordinates. Narrowing explicitly here (rather than treating anything
// without `error === true` as a listing) keeps the intent readable.
type CoordinateBearing = Listing | ListingMarker;

function hasCoordinateField(
  listing: CoordinateBearing | SelectedListing | null | undefined
): listing is CoordinateBearing {
  if (!listing) return false;
  if (isListingError(listing as SelectedListing)) return false;
  return "coordinates" in listing;
}

export function getListingCoordinates(
  listing: CoordinateBearing | SelectedListing | null | undefined
): ListingCoordinates | null {
  if (!hasCoordinateField(listing)) return null;
  return listing.coordinates ?? null;
}

export function hasValidCoordinates(
  listing: CoordinateBearing | SelectedListing | null | undefined
): listing is CoordinateBearing & { coordinates: ListingCoordinates } {
  const coordinates = getListingCoordinates(listing);
  return Boolean(
    coordinates &&
    typeof coordinates.latitude === "number" &&
    typeof coordinates.longitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude)
  );
}

// Expand a viewport bbox by a fraction (e.g. 0.3 => 30% larger in each
// direction). This lets us fetch a slightly padded area so that small pans
// reuse already-loaded pins without hitting the network again.
export function padBounds(bounds: LngLatBounds, factor = 0.3): BoundingBox {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const latSpan = ne.lat - sw.lat;
  const lngSpan = ne.lng - sw.lng;

  const latPad = latSpan * factor;
  const lngPad = lngSpan * factor;

  return {
    south: Math.max(-90, sw.lat - latPad),
    north: Math.min(90, ne.lat + latPad),
    west: sw.lng - lngPad,
    east: ne.lng + lngPad,
  };
}

export function isCoordinateInBounds(
  bounds: LngLatBounds,
  coordinates: ListingCoordinates
): boolean {
  return bounds.contains([coordinates.longitude, coordinates.latitude]);
}
