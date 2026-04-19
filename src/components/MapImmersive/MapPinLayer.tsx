"use client";

import type { ComponentType } from "react";
import { Marker } from "react-map-gl/maplibre";

import MapPin from "@/components/MapPin";
import {
  hasValidCoordinates,
  type ListingCoordinates,
  type ListingMarker,
} from "@/utils/mapUtils";

type MapPinLayerProps = {
  listings: ListingMarker[];
  selectedListingId: number | null;
  DrawerTrigger: ComponentType<{ children?: React.ReactNode }>;
  onMarkerClick: (listing: ListingMarker) => void;
};

type MapPinType = "business" | "community" | "residential";

function toPinType(type: ListingMarker["type"]): MapPinType | undefined {
  return typeof type === "string" ? (type as MapPinType) : undefined;
}

export default function MapPinLayer({
  listings,
  selectedListingId,
  DrawerTrigger,
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
            <DrawerTrigger key={listing.id}>
              <Marker
                longitude={coords.longitude}
                latitude={coords.latitude}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  onMarkerClick(listing);
                }}
                style={{ zIndex: isSelected ? 1 : 0 }}
              >
                <MapPin selected={isSelected} type={toPinType(listing.type)} />
              </Marker>
            </DrawerTrigger>
          );
        })}
    </>
  );
}
