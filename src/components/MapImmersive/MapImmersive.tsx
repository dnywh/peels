"use client";

import { useCallback, useEffect } from "react";
import type { ComponentType, Ref } from "react";

import Map, {
  NavigationControl,
  AttributionControl,
  GeolocateControl,
  type MapRef,
  type ViewStateChangeEvent,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import { useTranslations } from "next-intl";

import MapSearch from "@/components/MapSearch";
import Button from "@/components/Button";
import MapPinLayer from "./MapPinLayer";

import { styled } from "@pigment-css/react";

import { useMapCenter } from "@/hooks/useMapCenter";
import {
  DEFAULT_COORDINATES,
  ZOOM_LEVEL_DEFAULT,
  ZOOM_LEVEL_SELECTED,
  getListingCoordinates,
  hasValidCoordinates,
  type ListingCoordinates,
  type ListingMarker,
  type SelectedListing,
} from "@/utils/mapUtils";

type MapImmersiveProps = {
  mapRef: Ref<MapRef | null>;
  searchInputRef?: Ref<HTMLInputElement | null>;
  listings: ListingMarker[];
  isFetching: boolean;
  selectedListing: SelectedListing | null;
  selectedListingId: number | null;
  listingSlug: string | null;
  initialCoordinates: (ListingCoordinates & { zoom: number }) | null;
  onBoundsChange: (bounds: maplibregl.LngLatBounds) => void;
  onMapClick: () => void;
  onMarkerClick: (listing: ListingMarker) => void;
  onSearchPick: (event: { feature?: { center?: [number, number] } }) => void;
  DrawerTrigger: ComponentType<{ children?: React.ReactNode }>;
  isDesktop: boolean;
  countryCode: string | null;
};

const MapSearchComponent = MapSearch as ComponentType<{
  onPick: (event: { feature?: { center?: [number, number] } }) => void;
  searchInputRef?: Ref<HTMLInputElement | null>;
  countryCode?: string | null;
  style?: React.CSSProperties;
}>;

const ButtonComponent = Button as ComponentType<{
  onClick?: () => void;
  variant?: string;
  size?: string;
  width?: string;
  children?: React.ReactNode;
}>;

const MapContainer = styled("div")({
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "lightblue",
});

const ReturnToListingButton = styled(ButtonComponent)({
  position: "absolute",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1,

  "@media (min-width: 768px)": {
    top: "auto",
    bottom: "20px",
  },
});

const LoadingChip = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "0.75rem",
  right: "0.75rem",
  zIndex: 1,
  padding: "0.25rem 0.75rem",
  borderRadius: "999px",
  background: theme.colors.background.top,
  boxShadow: "0 1px 6px rgba(0, 0, 0, 0.08)",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: theme.colors.text.secondary,
  opacity: 0.9,
  pointerEvents: "none",
  transition: "opacity 150ms ease",
}));

const attributionControlMobileStyle: React.CSSProperties = {
  marginRight: `calc(clamp(var(--spacing-tabBar-marginX), calc(((100vw - var(--spacing-tabBar-maxWidth)) / 2)), 100vw) + 4px)`,
  marginBottom: "5.25rem",
  opacity: 0.875,
};

const attributionControlDesktopStyle: React.CSSProperties = {
  opacity: 1,
  marginRight: "10px",
  marginBottom: "10px",
};

const searchStyle: React.CSSProperties = {
  position: "absolute",
  top: "0.75rem",
  left: "0.75rem",
  zIndex: 1,
};

// MapLibre style spec — protomaps tiles with the bundled light theme. Kept as
// a factory so the Map receives a stable object only when the key changes.
function buildMapStyle() {
  return {
    version: 8 as const,
    glyphs:
      "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector" as const,
        url: `https://api.protomaps.com/tiles/v4.json?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`,
        attribution: '<a href="https://protomaps.com">Protomaps</a>',
      },
    },
    layers: layers("protomaps", "light", "en"),
  };
}

function resolveInitialViewState(
  selectedListing: SelectedListing | null,
  initialCoordinates: (ListingCoordinates & { zoom: number }) | null
) {
  const selectedCoords = getListingCoordinates(selectedListing);
  const isSelected =
    hasValidCoordinates(selectedListing) && selectedCoords !== null;

  return {
    longitude:
      (isSelected ? selectedCoords!.longitude : undefined) ??
      initialCoordinates?.longitude ??
      DEFAULT_COORDINATES.longitude,
    latitude:
      (isSelected ? selectedCoords!.latitude : undefined) ??
      initialCoordinates?.latitude ??
      DEFAULT_COORDINATES.latitude,
    zoom: isSelected
      ? ZOOM_LEVEL_SELECTED
      : (initialCoordinates?.zoom ?? ZOOM_LEVEL_DEFAULT),
  };
}

export default function MapImmersive({
  mapRef,
  searchInputRef,
  listings,
  isFetching,
  selectedListing,
  selectedListingId,
  listingSlug,
  initialCoordinates,
  onBoundsChange,
  onMapClick,
  onMarkerClick,
  onSearchPick,
  DrawerTrigger,
  isDesktop,
  countryCode,
}: MapImmersiveProps) {
  const t = useTranslations("Map");
  const mapRefObject = mapRef as React.RefObject<MapRef | null>;

  const { isSelectedInView, handleMapLoad, handleMapMoveEnd, flyToSelected } =
    useMapCenter({
      mapRef: mapRefObject,
      selectedListing,
    });

  const hasInitialPosition =
    hasValidCoordinates(selectedListing) || Boolean(initialCoordinates);

  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleLoad = useCallback(() => {
    handleMapLoad();
    const map = mapRefObject.current?.getMap();
    if (map) {
      onBoundsChange(map.getBounds());
    }
  }, [handleMapLoad, mapRefObject, onBoundsChange]);

  const handleMoveEnd = useCallback(
    (_event: ViewStateChangeEvent) => {
      const map = mapRefObject.current?.getMap();
      if (!map) return;
      onBoundsChange(map.getBounds());
      handleMapMoveEnd();
    },
    [handleMapMoveEnd, mapRefObject, onBoundsChange]
  );

  const handleMapClickInternal = useCallback(
    (_event: MapLayerMouseEvent) => {
      if (selectedListingId !== null || listingSlug) {
        onMapClick();
      }
    },
    [listingSlug, onMapClick, selectedListingId]
  );

  const showReturnButton = Boolean(
    selectedListing && listingSlug && !isSelectedInView
  );

  return (
    <MapContainer>
      {hasInitialPosition && (
        <>
          <Map
            ref={mapRef}
            attributionControl={false}
            mapStyle={buildMapStyle()}
            renderWorldCopies={true}
            initialViewState={resolveInitialViewState(
              selectedListing,
              initialCoordinates
            )}
            onMoveEnd={handleMoveEnd}
            onLoad={handleLoad}
            onClick={handleMapClickInternal}
          >
            <GeolocateControl showUserLocation={true} />
            <NavigationControl showZoom={true} showCompass={false} />

            <AttributionControl
              compact={true}
              style={
                !isDesktop
                  ? attributionControlMobileStyle
                  : attributionControlDesktopStyle
              }
            />

            <MapPinLayer
              listings={listings}
              selectedListingId={selectedListingId}
              DrawerTrigger={DrawerTrigger}
              onMarkerClick={onMarkerClick}
            />
          </Map>

          <MapSearchComponent
            searchInputRef={searchInputRef}
            onPick={onSearchPick}
            countryCode={countryCode}
            style={searchStyle}
          />

          {isFetching && <LoadingChip>{t("loadingPins")}</LoadingChip>}

          {showReturnButton && (
            <ReturnToListingButton
              onClick={flyToSelected}
              variant="secondary"
              size="small"
              width="contained"
            >
              {t("returnToListing")}
            </ReturnToListingButton>
          )}
        </>
      )}
    </MapContainer>
  );
}
