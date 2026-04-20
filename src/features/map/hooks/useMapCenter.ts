"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";

import type { ListingCoordinates, SelectedListing } from "@/types/listing";

import {
  FLY_DURATION,
  ZOOM_LEVEL_SELECTED,
  getListingCoordinates,
  hasValidCoordinates,
  isCoordinateInBounds,
} from "../lib/mapUtils";

type UseMapCenterArgs = {
  mapRef: React.RefObject<MapRef | null>;
  selectedListing: SelectedListing | null;
};

type UseMapCenterResult = {
  // Whether the selected listing's coordinate is currently inside the map viewport.
  // Used to decide if the "Return to listing" button should show.
  isSelectedInView: boolean;
  // Called from the map's onLoad handler. Performs the single "initial jump"
  // so the map never flickers from a temporary position to its real one.
  handleMapLoad: () => void;
  // Called from the map's onMoveEnd handler.
  handleMapMoveEnd: () => void;
  // Explicit fly-to for the "Return to listing" button.
  flyToSelected: () => void;
  // Explicit fly-to for a search pick.
  flyToCoordinate: (coordinate: ListingCoordinates, zoom?: number) => void;
};

// Single owner of every programmatic map motion, so the four old fly-to rules
// (initial centre, URL-driven selection, return-to-listing, search pick) no
// longer race each other.
//
// Rules encoded here:
// 1. Initial mount — caller passes an initial centre via `initialViewState`
//    on the <Map>; this hook only takes over once the map has loaded.
// 2. URL-driven selection change — if the selected listing's coordinate is
//    already in view, do not move. Otherwise flyTo with a short animation.
// 3. User taps "Return to listing" — flyTo with a slightly longer animation.
// 4. Search pick — flyTo the searched coordinate at the provided zoom.
export function useMapCenter({
  mapRef,
  selectedListing,
}: UseMapCenterArgs): UseMapCenterResult {
  // Start as `true` so the "Return to listing" button doesn't flash on before
  // we've had a chance to measure anything.
  const [isSelectedInView, setIsSelectedInView] = useState(true);

  // Ids we've already "handled" for URL-driven centring. Prevents us from
  // flying to the same listing more than once as unrelated state changes.
  const centeredListingIdRef = useRef<number | null>(null);
  // Tracks whether onLoad has run, so we don't double-centre on mount.
  const hasHandledLoadRef = useRef(false);

  const recomputeIsInView = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!hasValidCoordinates(selectedListing)) {
      setIsSelectedInView(true);
      return;
    }

    const coordinates = getListingCoordinates(selectedListing);
    if (!coordinates) {
      setIsSelectedInView(true);
      return;
    }

    setIsSelectedInView(isCoordinateInBounds(map.getBounds(), coordinates));
  }, [mapRef, selectedListing]);

  const handleMapLoad = useCallback(() => {
    hasHandledLoadRef.current = true;

    // If we loaded with a selected listing, "claim" its id so the effect below
    // doesn't try to fly to it again (the map's initialViewState already did).
    if (hasValidCoordinates(selectedListing)) {
      centeredListingIdRef.current = selectedListing.id;
    }

    recomputeIsInView();
  }, [recomputeIsInView, selectedListing]);

  const handleMapMoveEnd = useCallback(() => {
    recomputeIsInView();
  }, [recomputeIsInView]);

  // URL-driven selection centring.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !hasHandledLoadRef.current) return;
    if (!hasValidCoordinates(selectedListing)) return;

    const listingId = selectedListing.id;
    if (centeredListingIdRef.current === listingId) {
      return;
    }

    const coordinates = getListingCoordinates(selectedListing);
    if (!coordinates) return;

    const inView = isCoordinateInBounds(map.getBounds(), coordinates);
    centeredListingIdRef.current = listingId;

    if (inView) {
      setIsSelectedInView(true);
      return;
    }

    mapRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: ZOOM_LEVEL_SELECTED,
      duration: FLY_DURATION.urlSelection,
    });
  }, [mapRef, selectedListing]);

  const flyToSelected = useCallback(() => {
    if (!hasValidCoordinates(selectedListing)) return;
    const coordinates = getListingCoordinates(selectedListing);
    if (!coordinates) return;

    mapRef.current?.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      duration: FLY_DURATION.returnToListing,
    });
  }, [mapRef, selectedListing]);

  const flyToCoordinate = useCallback(
    (coordinate: ListingCoordinates, zoom?: number) => {
      mapRef.current?.flyTo({
        center: [coordinate.longitude, coordinate.latitude],
        duration: FLY_DURATION.searchPick,
        ...(typeof zoom === "number" ? { zoom } : {}),
      });
    },
    [mapRef]
  );

  return {
    isSelectedInView,
    handleMapLoad,
    handleMapMoveEnd,
    flyToSelected,
    flyToCoordinate,
  };
}
