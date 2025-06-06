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
  const isFirstLoad = useRef(true);
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

    // If there's a selected listing, center on it instead of using IP location
    if (selectedListing?.latitude && selectedListing?.longitude) {
      mapRef.current?.flyTo({
        center: [selectedListing.longitude, selectedListing.latitude],
        zoom: 12,
        duration: 0,
      });
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

    // Check if selected listing is in view
    if (selectedListing) {
      const isInView = bounds.contains([
        selectedListing.longitude,
        selectedListing.latitude,
      ]);
      setIsListingInView(isInView);
    }
  }, [onBoundsChange, selectedListing]);

  const handleFlyToListing = useCallback(() => {
    if (!selectedListing || !mapRef.current) return;

    mapRef.current.flyTo({
      center: [selectedListing.longitude, selectedListing.latitude],
      // zoom: 12,
      duration: 1500,
    });
  }, [selectedListing]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Only handle initial positioning on first load
    if (isFirstLoad.current) {
      isFirstLoad.current = false;

      // If there's a selected listing in URL, center on it
      if (selectedListing?.latitude && selectedListing?.longitude) {
        mapRef.current?.flyTo({
          center: [selectedListing.longitude, selectedListing.latitude],
          zoom: 12,
          duration: 0,
        });
      }
      // If no listing but we have IP coordinates, use those
      else if (initialCoordinates) {
        mapRef.current?.flyTo({
          center: [initialCoordinates.longitude, initialCoordinates.latitude],
          zoom: initialCoordinates.zoom,
          duration: 0,
        });
      }
    }

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []); // Empty dependency array as before

  // Set mapController to set relationship between MapSearch and MapImmersive
  // Can't get this to work, perhaps delete all mapController and createMapLibreGlMapController code if I can't get it working
  // useEffect(() => {
  //   if (mapRef.current) return; // stops map from intializing more than once
  //   setMapController(createMapLibreGlMapController(mapRef.current, maplibregl));
  // }, [onBoundsChange]);

  // TODO: low-priority: IF location is active AND it leaves the bounding box (i.e. user has moved the map), add a button to recenter (and zoom) map on selected listing

  // Update lastKnownPosition when we have a valid position
  useEffect(() => {
    if (selectedListing) {
      setLastKnownPosition({
        latitude: selectedListing.latitude,
        longitude: selectedListing.longitude,
        // zoom: 12,
      });
    } else if (initialCoordinates && !lastKnownPosition) {
      setLastKnownPosition(initialCoordinates);
    }
  }, [selectedListing, initialCoordinates]);

  // Check if listing is in view whenever the map moves or selectedListing changes
  useEffect(() => {
    if (!mapRef.current || !selectedListing) {
      setIsListingInView(true);
      return;
    }

    const bounds = mapRef.current.getMap().getBounds();
    const isInView = bounds.contains([
      selectedListing.longitude,
      selectedListing.latitude,
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
                selectedListing?.longitude ||
                initialCoordinates?.longitude ||
                DEFAULT_COORDINATES.longitude,
              latitude:
                selectedListing?.latitude ||
                initialCoordinates?.latitude ||
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

            {listings.map((listing) => (
              <DrawerTrigger key={listing.id}>
                <Marker
                  longitude={listing.longitude}
                  latitude={listing.latitude}
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
