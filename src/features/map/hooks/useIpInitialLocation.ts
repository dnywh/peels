"use client";

import { useEffect, useRef, useState } from "react";
import { config, geolocation } from "@maptiler/client";

import { ZOOM_LEVEL_DEFAULT } from "../lib/mapUtils";
import {
  NEUTRAL_INITIAL_COORDINATES,
  readStoredInitialMapCoordinates,
  type InitialMapCoordinates,
} from "../lib/mapInitialView";

type UseIpInitialLocationArgs = {
  // Skip when the page already has a listing slug (deep-linked selections
  // centre on the listing instead of the user's IP location).
  skip?: boolean;
};

type UseIpInitialLocationResult = {
  initialCoordinates: InitialMapCoordinates | null;
  countryCode: string | null;
};

type MapTilerIpLocation = {
  latitude?: number;
  longitude?: number;
  country_code?: string;
};

// Guarded one-time init so the key is only assigned in the browser (the hook
// only runs client-side) and only on the first consumer of the hook.
let hasConfiguredMapTiler = false;

function ensureMapTilerConfig() {
  if (hasConfiguredMapTiler) return;
  const key = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  if (!key) return;
  config.apiKey = key;
  hasConfiguredMapTiler = true;
}

const INITIAL_LOCATION_TIMEOUT_MS = 1500;

// One-time initial centre. Prefer the user's last viewed map area, otherwise
// wait briefly for IP location before falling back to a neutral world view.
export function useIpInitialLocation({
  skip = false,
}: UseIpInitialLocationArgs = {}): UseIpInitialLocationResult {
  const shouldApplyIpCoordinatesRef = useRef(false);
  const [initialCoordinates, setInitialCoordinates] =
    useState<InitialMapCoordinates | null>(() => {
      if (skip) return NEUTRAL_INITIAL_COORDINATES;
      const storedCoordinates = readStoredInitialMapCoordinates();
      shouldApplyIpCoordinatesRef.current = storedCoordinates === null;
      return storedCoordinates;
    });
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    if (skip) {
      // Deep-linked selections centre on the listing when possible. Otherwise
      // the neutral fallback keeps the map mountable.
      setInitialCoordinates(
        (current) => current ?? NEUTRAL_INITIAL_COORDINATES
      );
      return;
    }

    ensureMapTilerConfig();

    let cancelled = false;

    if (!shouldApplyIpCoordinatesRef.current) {
      async function initializeCountryCode() {
        try {
          const response = (await geolocation.info()) as MapTilerIpLocation;
          if (!cancelled) {
            setCountryCode(response.country_code ?? null);
          }
        } catch {
          // The stored map view is enough to render; country-code narrowing is
          // a best-effort enhancement for search.
        }
      }

      initializeCountryCode();

      return () => {
        cancelled = true;
      };
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const applyFallback = () => {
      if (cancelled) return;
      if (shouldApplyIpCoordinatesRef.current) {
        setInitialCoordinates(NEUTRAL_INITIAL_COORDINATES);
        shouldApplyIpCoordinatesRef.current = false;
      }
    };

    async function initializeLocation() {
      // Race the network call against a short timeout. We track the timeout id
      // so a successful geolocation response can cancel the pending fallback
      // work before it fires.
      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          resolve(null);
        }, INITIAL_LOCATION_TIMEOUT_MS);
      });

      try {
        const response = (await Promise.race([
          geolocation.info(),
          timeoutPromise,
        ])) as MapTilerIpLocation | null;

        if (cancelled) return;
        if (!response) {
          applyFallback();
          return;
        }

        const lat = response?.latitude;
        const lng = response?.longitude;
        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          setCountryCode(response.country_code ?? null);
          if (shouldApplyIpCoordinatesRef.current) {
            setInitialCoordinates({
              latitude: lat,
              longitude: lng,
              zoom: ZOOM_LEVEL_DEFAULT,
            });
            shouldApplyIpCoordinatesRef.current = false;
          }
        } else {
          applyFallback();
        }
      } catch (error) {
        if (cancelled) return;
        console.warn(
          "Could not determine location from MapTiler:",
          (error as Error).message
        );
        applyFallback();
      } finally {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    }

    initializeLocation();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [skip]);

  return { initialCoordinates, countryCode };
}
