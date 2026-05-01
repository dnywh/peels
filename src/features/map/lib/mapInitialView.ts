import type { ListingCoordinates } from "@/types/listing";

import { MAP_MAX_ZOOM, wrapLongitude } from "./mapUtils";
import { STORED_MAP_VIEW_KEY } from "./mapStorageConstants";

export type InitialMapCoordinates = ListingCoordinates & { zoom: number };

export const NEUTRAL_INITIAL_COORDINATES: InitialMapCoordinates = {
  latitude: 20,
  longitude: 0,
  zoom: 1.5,
};

function isValidInitialMapCoordinates(
  value: Partial<InitialMapCoordinates> | null
): value is InitialMapCoordinates {
  return Boolean(
    value &&
    typeof value.latitude === "number" &&
    Number.isFinite(value.latitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    typeof value.longitude === "number" &&
    Number.isFinite(value.longitude) &&
    typeof value.zoom === "number" &&
    Number.isFinite(value.zoom) &&
    value.zoom >= 0
  );
}

function normaliseInitialMapCoordinates(
  value: Partial<InitialMapCoordinates> | null
): InitialMapCoordinates | null {
  if (!isValidInitialMapCoordinates(value)) return null;

  return {
    latitude: value.latitude,
    longitude: wrapLongitude(value.longitude),
    zoom: Math.min(value.zoom, MAP_MAX_ZOOM),
  };
}

export function readStoredInitialMapCoordinates() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(STORED_MAP_VIEW_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value) as Partial<InitialMapCoordinates> | null;
    return normaliseInitialMapCoordinates(parsed);
  } catch {
    return null;
  }
}

export function saveStoredInitialMapCoordinates(
  coordinates: InitialMapCoordinates
) {
  if (typeof window === "undefined") return;
  const normalisedCoordinates = normaliseInitialMapCoordinates(coordinates);
  if (!normalisedCoordinates) return;

  try {
    window.localStorage.setItem(
      STORED_MAP_VIEW_KEY,
      JSON.stringify(normalisedCoordinates)
    );
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }
}
