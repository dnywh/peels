"use client";
import { theme } from "@/styles/theme.yak";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";

import Map, {
  NavigationControl,
  AttributionControl,
  GeolocateControl,
  type MapRef,
  type ViewStateChangeEvent,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type { LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocale, useTranslations } from "next-intl";
import { styled } from "next-yak";

import Button from "@/components/Button";
import type { ListingMarker, SelectedListing } from "@/types/listing";

import MapPinLayer from "./MapPinLayer";
import MapSearch from "./MapSearch";
import {
  MAP_MAX_ZOOM,
  ZOOM_LEVEL_DEFAULT,
  ZOOM_LEVEL_SELECTED,
  getListingCoordinates,
  hasValidCoordinates,
  wrapLongitude,
} from "../lib/mapUtils";
import { useListingsInView } from "../hooks/useListingsInView";
import { useMapCenter } from "../hooks/useMapCenter";
import { usePreferredMapFlavor } from "../hooks/usePreferredMapFlavor";
import { createProtomapsStyle } from "../lib/protomapsStyle";
import {
  NEUTRAL_INITIAL_COORDINATES,
  saveStoredInitialMapCoordinates,
  type InitialMapCoordinates,
} from "../lib/mapInitialView";

type GeocodingPickEvent = {
  feature?: { center?: [number, number] };
};

type MapViewProps = {
  selectedListing: SelectedListing | null;
  selectedListingId: number | null;
  listingSlug: string | null;
  isListingSelected: boolean;
  initialCoordinates: InitialMapCoordinates | null;
  onMapClick: () => void;
  onMarkerClick: (listing: ListingMarker) => void;
  DrawerTrigger: ComponentType<{ children?: React.ReactNode }>;
  isDesktop: boolean;
  countryCode: string | null;
};

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: lightblue;
`;

const ReturnToListingButton = styled(Button)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  @media (min-width: 768px) {
    top: auto;
    bottom: 20px;
  }
`;

const LoadingChip = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: ${theme.colors.background.top};
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  font-size: 0.75rem;
  font-weight: 500;
  color: ${theme.colors.text.secondary};
  opacity: 0.9;
  pointer-events: none;
  transition: opacity 150ms ease;
`;

const attributionControlMobileStyle: CSSProperties = {
  marginRight: `calc(clamp(var(--spacing-tabBar-marginX), calc(((100vw - var(--spacing-tabBar-maxWidth)) / 2)), 100vw) + 4px)`,
  marginBottom: "5.25rem",
  opacity: 0.875,
};

const attributionControlDesktopStyle: CSSProperties = {
  opacity: 1,
  marginRight: "10px",
  marginBottom: "10px",
};

const searchStyle: CSSProperties = {
  position: "absolute",
  top: "0.75rem",
  left: "0.75rem",
  zIndex: 1,
};

const STORE_MAP_VIEW_DELAY_MS = 300;
const STORE_MAP_VIEW_DELTA = 0.000001;
const STORE_MAP_ZOOM_DELTA = 0.01;

function resolveInitialViewState(
  selectedListing: SelectedListing | null,
  initialCoordinates: InitialMapCoordinates | null
) {
  const selectedCoords = getListingCoordinates(selectedListing);
  const isSelected =
    hasValidCoordinates(selectedListing) && selectedCoords !== null;

  return {
    longitude:
      (isSelected ? selectedCoords!.longitude : undefined) ??
      initialCoordinates?.longitude ??
      NEUTRAL_INITIAL_COORDINATES.longitude,
    latitude:
      (isSelected ? selectedCoords!.latitude : undefined) ??
      initialCoordinates?.latitude ??
      NEUTRAL_INITIAL_COORDINATES.latitude,
    zoom: isSelected
      ? ZOOM_LEVEL_SELECTED
      : (initialCoordinates?.zoom ?? NEUTRAL_INITIAL_COORDINATES.zoom),
  };
}

export default function MapView({
  selectedListing,
  selectedListingId,
  listingSlug,
  isListingSelected,
  initialCoordinates,
  onMapClick,
  onMarkerClick,
  DrawerTrigger,
  isDesktop,
  countryCode,
}: MapViewProps) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const mapFlavor = usePreferredMapFlavor();
  const mapRef = useRef<MapRef | null>(null);
  const saveMapViewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastSavedMapViewRef = useRef<InitialMapCoordinates | null>(
    initialCoordinates
  );
  const mapStyle = useMemo(
    () => createProtomapsStyle({ flavorName: mapFlavor, locale }),
    [locale, mapFlavor]
  );
  const initialViewState = useMemo(
    () => resolveInitialViewState(selectedListing, initialCoordinates),
    [initialCoordinates, selectedListing]
  );

  const { listings, isFetching, requestBounds } = useListingsInView();

  const {
    isSelectedInView,
    handleMapLoad,
    handleMapMoveEnd,
    flyToSelected,
    flyToCoordinate,
  } = useMapCenter({
    mapRef,
    selectedListing,
  });

  const emitBoundsChange = useCallback(
    (bounds: LngLatBounds) => {
      requestBounds(bounds);
    },
    [requestBounds]
  );

  const handleLoad = useCallback(() => {
    handleMapLoad();
    const map = mapRef.current?.getMap();
    if (map) {
      emitBoundsChange(map.getBounds());
    }
  }, [emitBoundsChange, handleMapLoad]);

  useEffect(() => {
    if (initialCoordinates) {
      lastSavedMapViewRef.current = initialCoordinates;
    }
  }, [initialCoordinates]);

  const scheduleStoredMapViewSave = useCallback(() => {
    if (saveMapViewTimeoutRef.current !== null) {
      clearTimeout(saveMapViewTimeoutRef.current);
    }

    saveMapViewTimeoutRef.current = setTimeout(() => {
      saveMapViewTimeoutRef.current = null;

      const map = mapRef.current?.getMap();
      if (!map) return;

      const center = map.getCenter();
      const coordinates = {
        latitude: center.lat,
        longitude: wrapLongitude(center.lng),
        zoom: map.getZoom(),
      };
      const lastSaved = lastSavedMapViewRef.current;
      const hasMeaningfulChange =
        !lastSaved ||
        Math.abs(lastSaved.latitude - coordinates.latitude) >
          STORE_MAP_VIEW_DELTA ||
        Math.abs(lastSaved.longitude - coordinates.longitude) >
          STORE_MAP_VIEW_DELTA ||
        Math.abs(lastSaved.zoom - coordinates.zoom) > STORE_MAP_ZOOM_DELTA;

      if (!hasMeaningfulChange) return;

      saveStoredInitialMapCoordinates(coordinates);
      lastSavedMapViewRef.current = coordinates;
    }, STORE_MAP_VIEW_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveMapViewTimeoutRef.current !== null) {
        clearTimeout(saveMapViewTimeoutRef.current);
      }
    };
  }, []);

  const handleMoveEnd = useCallback(
    (_event: ViewStateChangeEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      scheduleStoredMapViewSave();
      emitBoundsChange(map.getBounds());
      handleMapMoveEnd();
    },
    [emitBoundsChange, handleMapMoveEnd, scheduleStoredMapViewSave]
  );

  const handleMapClickInternal = useCallback(
    (_event: MapLayerMouseEvent) => {
      if (selectedListingId !== null || isListingSelected || listingSlug) {
        onMapClick();
      }
    },
    [isListingSelected, listingSlug, onMapClick, selectedListingId]
  );

  const handleSearchPick = useCallback(
    (event: GeocodingPickEvent) => {
      // Quirk in MapTiler's Geocoding component: tapping close is also an
      // "onPick" with no center. Ignore those.
      const center = event?.feature?.center;
      if (!center) return;

      flyToCoordinate(
        { longitude: center[0], latitude: center[1] },
        ZOOM_LEVEL_DEFAULT
      );
    },
    [flyToCoordinate]
  );

  const showReturnButton = Boolean(
    selectedListing && isListingSelected && !isSelectedInView
  );
  const hasInitialPosition =
    hasValidCoordinates(selectedListing) || initialCoordinates !== null;

  return (
    <MapContainer data-testid="map-view">
      {hasInitialPosition ? (
        <>
          <Map
            ref={mapRef}
            attributionControl={false}
            mapStyle={mapStyle}
            maxZoom={MAP_MAX_ZOOM}
            renderWorldCopies={true}
            initialViewState={initialViewState}
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

          <MapSearch
            onPick={handleSearchPick}
            countryCode={countryCode}
            style={searchStyle}
          />
        </>
      ) : (
        <LoadingChip>{t("loadingPins")}</LoadingChip>
      )}

      {hasInitialPosition && isFetching && (
        <LoadingChip>{t("loadingPins")}</LoadingChip>
      )}

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
    </MapContainer>
  );
}
