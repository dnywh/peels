"use client";
import { useEffect, useState, useCallback, useRef } from "react";

import Map, {
  Marker,
  NavigationControl,
  AttributionControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";

import LoadingSpinner from "@/components/LoadingSpinner";
import MapPin from "@/components/MapPin";
import MapSearch from "@/components/MapSearch";
import Button from "@/components/Button";

import { styled } from "@pigment-css/react";

const snapPoints = ["148px", "355px", 1];

const ReturnToListingButton = styled(Button)({
  position: "absolute",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 1, // Could be interfering with drawer scroll, try setting to 0

  "@media (min-width: 768px)": {
    top: "auto",
    bottom: "20px",
  },
});

const attributionControlMobileStyle = {
  // Optically position attribution control above-right of TabBar
  marginRight: `calc(clamp(var(--spacing-tabBar-marginX), calc(((100vw - var(--spacing-tabBar-maxWidth)) / 2)), 100vw) + 4px)`,
  marginBottom: "5.25rem", // Place above bottom TabBar
  opacity: 0.875,
};
const attributionControlDesktopStyle = {
  opacity: 1,
  marginRight: "10px",
  marginBottom: "10px",
};

// Default coordinates for Brisbane, Australia
const DEFAULT_COORDINATES = {
  longitude: 153.0322,
  latitude: -27.4683,
  zoom: 9,
};

function getListingCoordinates(listing) {
  return listing?.coordinates ?? null;
}

function hasValidCoordinates(listing) {
  const coordinates = getListingCoordinates(listing);

  return (
    listing &&
    !listing.error &&
    typeof coordinates?.latitude === "number" &&
    typeof coordinates?.longitude === "number" &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude)
  );
}

export default function MapImmersive({
  mapRef,
  searchInputRef,
  listings,
  selectedListing,
  listingSlug,
  initialCoordinates,
  onBoundsChange,
  isLoading,
  onMapClick,
  onMarkerClick,
  onSearchPick,
  setMapController,
  handleSearchPick,
  mapController,
  DrawerTrigger,
  preventDrawerClose,
  selectedPinId,
  setSelectedPinId,
  isDesktop,
  countryCode,
}) {
  const selectedListingCoordinates = getListingCoordinates(selectedListing);
  const hasAppliedInitialPositionRef = useRef(false);
  const centeredListingIdRef = useRef(null);
  const [lastKnownPosition, setLastKnownPosition] = useState(null);
  const [isListingInView, setIsListingInView] = useState(true);
  const hasInitialPosition =
    selectedListing || initialCoordinates || lastKnownPosition;

  const [snap, setSnap] = useState(snapPoints[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open) => {
    console.log("about to open?", open);

    if (open) {
      console.log("opening. Resetting snap point");
      setSnap(snapPoints[0]);
    }
    setIsOpen(open);
  };

  // Initial fetch when map loads
  const handleMapLoad = useCallback(() => {
    console.log("Map loaded");

    // If there's a selected listing with valid coords, center on it instead of using IP location
    if (hasValidCoordinates(selectedListing)) {
      const coordinates = getListingCoordinates(selectedListing);

      mapRef.current?.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 12,
        duration: 0,
      });
      hasAppliedInitialPositionRef.current = true;
      centeredListingIdRef.current = selectedListing.id;
    }

    const bounds = mapRef.current.getMap().getBounds();
    console.log("Bounds:", bounds);
    onBoundsChange(bounds);
  }, [onBoundsChange, selectedListing]);

  // Fetch on map move
  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return; // Add check for mapRef.current so this isn't called when user navigates to a different page.
    const map = mapRef.current.getMap();
    if (!map) return; // Add safety check for map object
    const bounds = map.getBounds();
    onBoundsChange(bounds);

    // Check if selected listing is in view (only when it has valid coords)
    if (hasValidCoordinates(selectedListing)) {
      const coordinates = getListingCoordinates(selectedListing);
      const isInView = bounds.contains([
        coordinates.longitude,
        coordinates.latitude,
      ]);
      setIsListingInView(isInView);
    }
  }, [onBoundsChange, selectedListing]);

  const handleFlyToListing = useCallback(() => {
    if (!hasValidCoordinates(selectedListing) || !mapRef.current) return;

    const coordinates = getListingCoordinates(selectedListing);

    mapRef.current.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      duration: 1500,
    });
  }, [selectedListing]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  useEffect(() => {
    if (
      hasAppliedInitialPositionRef.current ||
      hasValidCoordinates(selectedListing) ||
      !initialCoordinates ||
      !mapRef.current
    ) {
      return;
    }

    hasAppliedInitialPositionRef.current = true;
    mapRef.current.flyTo({
      center: [initialCoordinates.longitude, initialCoordinates.latitude],
      zoom: initialCoordinates.zoom,
      duration: 0,
    });
  }, [initialCoordinates, mapRef, selectedListing]);

  useEffect(() => {
    if (
      !mapRef.current ||
      !hasValidCoordinates(selectedListing) ||
      centeredListingIdRef.current === selectedListing.id
    ) {
      return;
    }

    const coordinates = getListingCoordinates(selectedListing);
    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    const isInView = bounds.contains([
      coordinates.longitude,
      coordinates.latitude,
    ]);

    if (isInView) {
      hasAppliedInitialPositionRef.current = true;
      centeredListingIdRef.current = selectedListing.id;
      setIsListingInView(true);
      return;
    }

    mapRef.current.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 12,
      duration: 900,
    });
    hasAppliedInitialPositionRef.current = true;
    centeredListingIdRef.current = selectedListing.id;
  }, [
    mapRef,
    selectedListing,
    selectedListingCoordinates?.latitude,
    selectedListingCoordinates?.longitude,
  ]);

  // Set mapController to set relationship between MapSearch and MapImmersive
  // Can't get this to work, perhaps delete all mapController and createMapLibreGlMapController code if I can't get it working
  // useEffect(() => {
  //   if (mapRef.current) return; // stops map from intializing more than once
  //   setMapController(createMapLibreGlMapController(mapRef.current, maplibregl));
  // }, [onBoundsChange]);

  // TODO: low-priority: IF location is active AND it leaves the bounding box (i.e. user has moved the map), add a button to recenter (and zoom) map on selected listing

  // Update lastKnownPosition when we have a valid position
  useEffect(() => {
    if (hasValidCoordinates(selectedListing)) {
      const coordinates = getListingCoordinates(selectedListing);

      setLastKnownPosition({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
    } else if (initialCoordinates && !lastKnownPosition) {
      setLastKnownPosition(initialCoordinates);
    }
  }, [selectedListing, initialCoordinates]);

  // Check if listing is in view whenever the map moves or selectedListing changes
  useEffect(() => {
    if (!mapRef.current || !hasValidCoordinates(selectedListing)) {
      setIsListingInView(true);
      return;
    }

    const bounds = mapRef.current.getMap().getBounds();
    const coordinates = getListingCoordinates(selectedListing);
    const isInView = bounds.contains([
      coordinates.longitude,
      coordinates.latitude,
    ]);
    console.log("isInView", isInView);
    setIsListingInView(isInView);
  }, [selectedListing]);

  // Update when selectedListing changes
  useEffect(() => {
    setSelectedPinId(selectedListing?.id || null);
  }, [selectedListing]);

  const handleMapClick = (event) => {
    console.log("Map clicked without marker click");
    if (selectedPinId) {
      setSelectedPinId(null); // This will update pin visuals immediately
      onMapClick(event); // This will handle the drawer closing
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "lightblue",

        // touchAction: "none",
        // pointerEvents: "none",
      }}
    >
      {isLoading ? <LoadingSpinner /> : null}

      {hasInitialPosition && (
        <>
          <Map
            ref={mapRef}
            attributionControl={false}
            mapStyle={{
              version: 8,
              glyphs:
                "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
              sprite:
                "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
              sources: {
                protomaps: {
                  type: "vector",
                  url: `https://api.protomaps.com/tiles/v4.json?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`,
                  attribution: '<a href="https://protomaps.com">Protomaps</a>',
                },
              },
              layers: layers("protomaps", "light"),
            }}
            renderWorldCopies={true}
            initialViewState={{
              longitude:
                (hasValidCoordinates(selectedListing)
                  ? selectedListingCoordinates.longitude
                  : null) ??
                initialCoordinates?.longitude ??
                DEFAULT_COORDINATES.longitude,
              latitude:
                (hasValidCoordinates(selectedListing)
                  ? selectedListingCoordinates.latitude
                  : null) ??
                initialCoordinates?.latitude ??
                DEFAULT_COORDINATES.latitude,
              zoom: selectedListing
                ? 8
                : initialCoordinates?.zoom || DEFAULT_COORDINATES.zoom,
            }}
            animationOptions={{ duration: 200 }}
            onMoveEnd={handleMapMove}
            onLoad={handleMapLoad}
            onClick={handleMapClick}
          >
            <GeolocateControl
              showUserLocation={true}
              animationOptions={{ duration: 100 }}
            />
            <NavigationControl showZoom={true} showCompass={false} />

            <AttributionControl
              compact={true}
              style={
                !isDesktop
                  ? attributionControlMobileStyle
                  : attributionControlDesktopStyle
              }
            />

            {listings
              .filter((listing) => hasValidCoordinates(listing))
              .map((listing) => (
                <DrawerTrigger key={listing.id}>
                  <Marker
                    longitude={listing.coordinates.longitude}
                    latitude={listing.coordinates.latitude}
                    anchor="center"
                    onClick={(event) => {
                      event.originalEvent.stopPropagation();
                      setSelectedPinId(listing.id); // Update pin visuals immediately
                      onMarkerClick(listing.id); // Handle the rest of the selection logic
                    }}
                    style={{
                      zIndex: selectedPinId === listing.id ? 1 : 0,
                    }}
                  >
                    <MapPin
                      selected={selectedPinId === listing.id} // Use selectedPinId instead of selectedListing
                      type={listing.type}
                    />
                  </Marker>
                </DrawerTrigger>
              ))}
          </Map>

          <MapSearch
            searchInputRef={searchInputRef}
            onPick={onSearchPick}
            mapController={mapController}
            countryCode={countryCode}
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              zIndex: 1, // Setting the z-index of the map controls to 0 seems to fix the drawer content's touch responsiveness
            }}
          />

          {/* selectedListing purposefully does not clear when returning to listing, as it clashes with the router. So we need to check for listingSlug too */}
          {selectedListing && listingSlug && !isListingInView && (
            <ReturnToListingButton
              onClick={handleFlyToListing}
              variant="secondary"
              size="small"
              width="contained"
            >
              Return to listing
            </ReturnToListingButton>
          )}
        </>
      )}
    </div>
  );
}
