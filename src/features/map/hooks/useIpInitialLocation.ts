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

    async function initializeLocation() {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Location timeout")), 3000);
        });

        const response = (await Promise.race([
          geolocation.info(),
          timeoutPromise,
        ])) as {
          latitude?: number;
          longitude?: number;
          country_code?: string;
        };

        if (cancelled) return;

        if (response?.latitude && response?.longitude) {
          setCountryCode(response.country_code ?? null);
          setInitialCoordinates({
            latitude: response.latitude,
            longitude: response.longitude,
            zoom: ZOOM_LEVEL_DEFAULT,
          });
        }
      } catch (error) {
        console.warn(
          "Could not determine location from MapTiler:",
          (error as Error).message
        );
      }
    }

    initializeLocation();

    return () => {
      cancelled = true;
    };
  }, [skip]);

  return { initialCoordinates, countryCode };
}
