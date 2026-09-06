"use client";

import { useMemo, useRef, type RefObject } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Supercluster from "supercluster";
import {
  Marker,
  type MarkerEvent,
  type MarkerInstance,
} from "react-map-gl/maplibre";
import type { FeatureCollection, Point } from "geojson";

import MapPin from "@/components/MapPin";
import type { ListingCoordinates, ListingMarker } from "@/types/listing";

import ClusterPinEnter, { ClusterPinEnterProvider } from "./ClusterPinEnter";
import {
  ListingMapPinMarker,
  useMapMarkerKeyboardActivation,
} from "./MapPinLayer";

type MapMirroredClusterLayerProps = {
  geoJson: FeatureCollection<Point>;
  listingsById: Map<number, ListingMarker>;
  bounds: [number, number, number, number] | null;
  zoom: number;
  selectedListingId: number | null;
  excludedListingId: number | null;
  markerLabel: string;
  onClusterClick: (
    longitude: number,
    latitude: number,
    expansionZoom: number
  ) => void;
  onMarkerClick: (listing: ListingMarker) => void;
  clusterMaxZoom?: number;
  clusterRadius?: number;
};

type VisibleMirroredPin = {
  key: string;
  longitude: number;
  latitude: number;
  isCluster: boolean;
  clusterId?: number;
  listingId?: number;
};

function resolveVisibleMirroredPins(
  features: ReturnType<Supercluster["getClusters"]>,
  excludedListingId: number | null
): VisibleMirroredPin[] {
  const visiblePins: VisibleMirroredPin[] = [];

  for (const feature of features) {
    const [longitude, latitude] = feature.geometry.coordinates as [
      number,
      number,
    ];
    const isCluster = Boolean(feature.properties?.cluster);

    if (isCluster) {
      const clusterId = feature.properties.cluster_id as number;
      visiblePins.push({
        key: `mirrored-cluster-${clusterId}`,
        longitude,
        latitude,
        isCluster: true,
        clusterId,
      });
      continue;
    }

    const listingId = feature.properties?.id as number;
    if (listingId === excludedListingId) {
      continue;
    }

    visiblePins.push({
      key: `mirrored-${listingId}`,
      longitude,
      latitude,
      isCluster: false,
      listingId,
    });
  }

  return visiblePins;
}

function MirroredClusterPinMarker({
  pinKey,
  longitude,
  latitude,
  markerLabel,
  onActivate,
}: {
  pinKey: string;
  longitude: number;
  latitude: number;
  markerLabel: string;
  onActivate: () => void;
}) {
  const markerRef = useRef<MarkerInstance | null>(null);

  useMapMarkerKeyboardActivation({
    markerRef,
    markerLabel,
    onActivate,
  });

  const handlePinClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopPropagation();
    onActivate();
  };

  const handleMarkerClick = (event: MarkerEvent<globalThis.MouseEvent>) => {
    event.originalEvent.stopPropagation();
    onActivate();
  };

  return (
    <Marker
      ref={markerRef}
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={handleMarkerClick}
    >
      <ClusterPinEnter>
        <MapPin markerId={pinKey} type="community" onClick={handlePinClick} />
      </ClusterPinEnter>
    </Marker>
  );
}

export default function MapMirroredClusterLayer({
  geoJson,
  listingsById,
  bounds,
  zoom,
  selectedListingId,
  excludedListingId,
  markerLabel,
  onClusterClick,
  onMarkerClick,
  clusterMaxZoom = 15,
  clusterRadius = 80,
}: MapMirroredClusterLayerProps) {
  const clusterIndex = useMemo(() => {
    const index = new Supercluster({
      radius: clusterRadius,
      maxZoom: clusterMaxZoom,
    });

    index.load(
      geoJson.features.map((feature) => ({
        type: "Feature" as const,
        properties: { ...feature.properties },
        geometry: feature.geometry,
      }))
    );

    return index;
  }, [clusterMaxZoom, clusterRadius, geoJson]);

  const visibleClusters = useMemo(() => {
    if (!bounds) return [];
    return clusterIndex.getClusters(bounds, Math.floor(zoom));
  }, [bounds, clusterIndex, zoom]);

  const visiblePins = useMemo(
    () => resolveVisibleMirroredPins(visibleClusters, excludedListingId),
    [excludedListingId, visibleClusters]
  );

  return (
    <ClusterPinEnterProvider>
      {visiblePins.map((pin) => {
        if (pin.isCluster && pin.clusterId !== undefined) {
          return (
            <MirroredClusterPinMarker
              key={pin.key}
              pinKey={pin.key}
              longitude={pin.longitude}
              latitude={pin.latitude}
              markerLabel={markerLabel}
              onActivate={() => {
                onClusterClick(
                  pin.longitude,
                  pin.latitude,
                  clusterIndex.getClusterExpansionZoom(pin.clusterId!)
                );
              }}
            />
          );
        }

        const listing =
          pin.listingId !== undefined
            ? listingsById.get(pin.listingId)
            : undefined;
        if (!listing) return null;

        const coords = listing.coordinates as ListingCoordinates;
        const isSelected = selectedListingId === listing.id;

        return (
          <ListingMapPinMarker
            key={pin.key}
            listing={listing}
            coords={coords}
            isSelected={isSelected}
            markerLabel={markerLabel}
            onMarkerClick={onMarkerClick}
            withClusterEnterAnimation
          />
        );
      })}
    </ClusterPinEnterProvider>
  );
}
