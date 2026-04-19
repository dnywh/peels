import type { LngLatBounds } from "maplibre-gl";

export type ListingType = "business" | "community" | "residential";

export type ListingCoordinates = {
  latitude: number;
  longitude: number;
};

export type ListingMarker = {
  id: number;
  type: ListingType | string | null;
  coordinates: ListingCoordinates | null;
};

export type SelectedListing = {
  id?: number;
  slug?: string;
  name?: string;
  type?: ListingType | string | null;
  coordinates?: ListingCoordinates | null;
  error?: boolean;
  message?: string;
  [key: string]: unknown;
};

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

export function getListingCoordinates(
  listing: SelectedListing | ListingMarker | null | undefined
): ListingCoordinates | null {
  const coords = (listing as { coordinates?: ListingCoordinates | null })
    ?.coordinates;
  return coords ?? null;
}

export function hasValidCoordinates(
  listing: SelectedListing | ListingMarker | null | undefined
): listing is (SelectedListing | ListingMarker) & {
  coordinates: ListingCoordinates;
} {
  const coordinates = getListingCoordinates(listing);
  const error = (listing as { error?: boolean } | null | undefined)?.error;

  return Boolean(
    listing &&
    !error &&
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
