"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Marker,
  type MarkerEvent,
  type MarkerInstance,
} from "react-map-gl/maplibre";

import MapPin from "@/components/MapPin";
import type { ListingCoordinates, ListingMarker } from "@/types/listing";

import { hasValidCoordinates } from "../lib/mapUtils";

type MapPinLayerProps = {
  listings: ListingMarker[];
  selectedListingId: number | null;
  onMarkerClick: (listing: ListingMarker) => void;
};

type ListingMapPinMarkerProps = {
  listing: ListingMarker;
  coords: ListingCoordinates;
  isSelected: boolean;
  onMarkerClick: MapPinLayerProps["onMarkerClick"];
};

const KEYBOARD_ACTIVATION_KEYS = new Set(["Enter", " "]);
// React handles pointer clicks on the inner 44px hit target, while MapLibre
// also reports marker clicks from its own element. Suppress only same-tick
// duplicate events without blocking deliberate follow-up activations.
const DUPLICATE_MARKER_CLICK_SUPPRESSION_MS = 100;

function ListingMapPinMarker({
  listing,
  coords,
  isSelected,
  onMarkerClick,
}: ListingMapPinMarkerProps) {
  const markerRef = useRef<MarkerInstance | null>(null);
  const lastPinPointerClickRef = useRef<{
    listingId: ListingMarker["id"];
    timeStamp: number;
  } | null>(null);
  const lastKeyboardActivationRef = useRef<number | null>(null);
  const isSpaceActivationPendingRef = useRef(false);

  useEffect(() => {
    const markerElement = markerRef.current?.getElement();
    if (!markerElement) return;

    markerElement.tabIndex = 0;

    const activateFromKeyboard = (event: KeyboardEvent) => {
      lastKeyboardActivationRef.current = event.timeStamp;
      onMarkerClick(listing);
    };

    const handleMarkerKeyDown = (event: KeyboardEvent) => {
      if (!KEYBOARD_ACTIVATION_KEYS.has(event.key)) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;

      if (event.key === " ") {
        isSpaceActivationPendingRef.current = true;
        return;
      }

      activateFromKeyboard(event);
    };

    const handleMarkerKeyUp = (event: KeyboardEvent) => {
      if (event.key !== " " || !isSpaceActivationPendingRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      isSpaceActivationPendingRef.current = false;
      activateFromKeyboard(event);
    };

    markerElement.addEventListener("keydown", handleMarkerKeyDown);
    markerElement.addEventListener("keyup", handleMarkerKeyUp);

    return () => {
      isSpaceActivationPendingRef.current = false;
      markerElement.removeEventListener("keydown", handleMarkerKeyDown);
      markerElement.removeEventListener("keyup", handleMarkerKeyUp);
    };
  }, [listing, onMarkerClick]);

  const handlePinClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopPropagation();
    lastPinPointerClickRef.current = {
      listingId: listing.id,
      timeStamp: event.timeStamp,
    };
    onMarkerClick(listing);
  };

  const handleMarkerClick = (event: MarkerEvent<globalThis.MouseEvent>) => {
    event.originalEvent.stopPropagation();
    const lastPinPointerClick = lastPinPointerClickRef.current;
    if (
      lastPinPointerClick?.listingId === listing.id &&
      Math.abs(lastPinPointerClick.timeStamp - event.originalEvent.timeStamp) <
        DUPLICATE_MARKER_CLICK_SUPPRESSION_MS
    ) {
      return;
    }

    const lastKeyboardActivation = lastKeyboardActivationRef.current;
    if (
      lastKeyboardActivation !== null &&
      Math.abs(lastKeyboardActivation - event.originalEvent.timeStamp) <
        DUPLICATE_MARKER_CLICK_SUPPRESSION_MS
    ) {
      return;
    }

    onMarkerClick(listing);
  };

  return (
    <Marker
      ref={markerRef}
      longitude={coords.longitude}
      latitude={coords.latitude}
      anchor="center"
      onClick={handleMarkerClick}
      style={{ zIndex: isSelected ? 1 : 0 }}
    >
      <MapPin
        markerId={listing.id}
        onClick={handlePinClick}
        selected={isSelected}
        type={listing.type ?? undefined}
      />
    </Marker>
  );
}

export default function MapPinLayer({
  listings,
  selectedListingId,
  onMarkerClick,
}: MapPinLayerProps) {
  return (
    <>
      {listings
        .filter((listing) => hasValidCoordinates(listing))
        .map((listing) => {
          const coords = listing.coordinates as ListingCoordinates;
          const isSelected = selectedListingId === listing.id;

          return (
            <ListingMapPinMarker
              key={listing.id}
              listing={listing}
              coords={coords}
              isSelected={isSelected}
              onMarkerClick={onMarkerClick}
            />
          );
        })}
    </>
  );
}
