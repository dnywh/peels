"use client";

import { useEffect, useState } from "react";
import { config, geolocation } from "@maptiler/client";

import type { ListingCoordinates } from "@/types/listing";

import { ZOOM_LEVEL_DEFAULT } from "../lib/mapUtils";

type UseIpInitialLocationArgs = {
  // Skip when the page already has a listing slug (deep-linked selections
  // centre on the listing instead of the user's IP location).
  skip?: boolean;
};

type UseIpInitialLocationResult = {
  initialCoordinates: (ListingCoordinates & { zoom: number }) | null;
  countryCode: string | null;
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

// One-time IP-based initial centre. MapView falls back to
// DEFAULT_COORDINATES if this fails or is skipped.
export function useIpInitialLocation({
  skip = false,
}: UseIpInitialLocationArgs = {}): UseIpInitialLocationResult {
  const [initialCoordinates, setInitialCoordinates] = useState<
    (ListingCoordinates & { zoom: number }) | null
  >(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    if (skip) return;

    ensureMapTilerConfig();

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function initializeLocation() {
      // Race the network call against a 3s timeout. We track the timeout id
      // so we can clear it once the race settles — otherwise the losing
      // branch can still fire and surface as an unhandled rejection.
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          reject(new Error("Location timeout"));
        }, 3000);
      });

      try {
        const response = (await Promise.race([
          geolocation.info(),
          timeoutPromise,
        ])) as {
          latitude?: number;
          longitude?: number;
          country_code?: string;
        };

        if (cancelled) return;

        const lat = response?.latitude;
        const lng = response?.longitude;
        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          setCountryCode(response.country_code ?? null);
          setInitialCoordinates({
            latitude: lat,
            longitude: lng,
            zoom: ZOOM_LEVEL_DEFAULT,
          });
        }
      } catch (error) {
        if (cancelled) return;
        console.warn(
          "Could not determine location from MapTiler:",
          (error as Error).message
        );
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
