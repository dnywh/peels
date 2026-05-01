import type { ListingCoordinates } from "@/types/listing";

import { MAP_MAX_ZOOM, wrapLongitude } from "./mapUtils";
import {
  STORED_MAP_VIEW_COOKIE_MAX_AGE,
  STORED_MAP_VIEW_KEY,
} from "./mapStorageConstants";

export type InitialMapCoordinates = ListingCoordinates & { zoom: number };

export const NEUTRAL_INITIAL_COORDINATES: InitialMapCoordinates = {
  latitude: 20,
  longitude: 0,
  zoom: 1.5,
};

const COOKIE_COORDINATE_PRECISION = 2;
const COOKIE_ZOOM_PRECISION = 2;

function roundToPrecision(value: number, precision: number) {
  const factor = 10 ** precision;
  const roundedValue = Math.round(value * factor) / factor;
  return Object.is(roundedValue, -0) ? 0 : roundedValue;
}

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

function coarsenInitialMapCoordinatesForCookie(
  value: InitialMapCoordinates
): InitialMapCoordinates {
  return {
    latitude: roundToPrecision(value.latitude, COOKIE_COORDINATE_PRECISION),
    longitude: roundToPrecision(value.longitude, COOKIE_COORDINATE_PRECISION),
    zoom: roundToPrecision(value.zoom, COOKIE_ZOOM_PRECISION),
  };
}

export function parseStoredInitialMapCoordinates(value: string | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<InitialMapCoordinates> | null;
    return normaliseInitialMapCoordinates(parsed);
  } catch {
    return null;
  }
}

export function readStoredInitialMapCoordinates() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(STORED_MAP_VIEW_KEY);
    return parseStoredInitialMapCoordinates(value);
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
  const serialisedCoordinates = JSON.stringify(normalisedCoordinates);
  // The cookie is only a hydration snapshot, so keep it coarse. localStorage
  // retains the precise client-side view without sending it back to the server.
  const serialisedCookieCoordinates = JSON.stringify(
    coarsenInitialMapCoordinatesForCookie(normalisedCoordinates)
  );

  try {
    window.localStorage.setItem(STORED_MAP_VIEW_KEY, serialisedCoordinates);
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }

  try {
    const secureAttribute =
      window.location.protocol === "https:" ? "; Secure" : "";
    window.document.cookie = `${STORED_MAP_VIEW_KEY}=${encodeURIComponent(
      serialisedCookieCoordinates
    )}; Path=/map; Max-Age=${STORED_MAP_VIEW_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
  } catch {
    // Ignore cookie write failures, such as restrictive browser settings.
  }
}
