"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LngLatBounds } from "maplibre-gl";

import { fetchListingsInView } from "@/app/actions";
import { padBounds, type ListingMarker } from "@/utils/mapUtils";

const DEBOUNCE_MS = 150;
const VIEWPORT_PAD_FACTOR = 0.3;

type UseListingsInViewResult = {
  listings: ListingMarker[];
  isFetching: boolean;
  requestBounds: (bounds: LngLatBounds) => void;
};

type Debounced<T extends (...args: never[]) => unknown> = T & {
  cancel: () => void;
};

// Trailing-edge debounce. Keeps the hook dependency-light (no @types/lodash).
function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number
): Debounced<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, wait);
  }) as Debounced<T>;

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

// Fetches listings for the current map viewport.
//
// - Debounces rapid pan/zoom calls (150 ms).
// - Each request gets a sequence id; only the latest response is applied, so
//   stale responses from abandoned viewports never overwrite fresh data.
// - Fetches a padded viewport (30% larger each side) so small pans reuse the
//   already-loaded pins and do not feel like they "pause" to reload.
// - Never clears `listings` mid-fetch — cached pins stay visible while the
//   next response is in flight.
export function useListingsInView(): UseListingsInViewResult {
  const [listings, setListings] = useState<ListingMarker[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const requestIdRef = useRef(0);
  const inFlightCountRef = useRef(0);

  const runFetch = useCallback(async (bounds: LngLatBounds) => {
    const padded = padBounds(bounds, VIEWPORT_PAD_FACTOR);

    const requestId = ++requestIdRef.current;
    inFlightCountRef.current += 1;
    setIsFetching(true);

    try {
      const data = await fetchListingsInView(
        padded.south,
        padded.west,
        padded.north,
        padded.east
      );

      // Ignore stale responses — a newer request has already superseded this one.
      if (requestId !== requestIdRef.current) return;

      setListings((data ?? []) as ListingMarker[]);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error fetching listings in view:", error);
    } finally {
      inFlightCountRef.current = Math.max(0, inFlightCountRef.current - 1);
      if (inFlightCountRef.current === 0) {
        setIsFetching(false);
      }
    }
  }, []);

  const debouncedFetch = useMemo(
    () => debounce(runFetch, DEBOUNCE_MS),
    [runFetch]
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  const requestBounds = useCallback(
    (bounds: LngLatBounds) => {
      debouncedFetch(bounds);
    },
    [debouncedFetch]
  );

  return { listings, isFetching, requestBounds };
}
