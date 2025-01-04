"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Map, {
  Marker,
  NavigationControl,
  AttributionControl,
  GeolocateControl,
} from "react-map-gl/maplibre";

import maplibregl from "maplibre-gl";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "maplibre-gl/dist/maplibre-gl.css";

import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import MapPin from "@/components/MapPin";
import MapSearch from "@/components/MapSearch";

import { Drawer } from "vaul";
import Button from "@/components/Button";
import CloseButton from "@/components/CloseButton";
const snapPoints = ["148px", "355px", 1];

export default function MapRender({
  mapRef,
  listings,
  selectedListing,
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
    console.log("MAP MOVED");
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

  // Set mapController to set relationship between MapSearch and MapRender
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
      }}
    >
      {isLoading ? <LoadingSpinner /> : null}

      {hasInitialPosition && (
        <>
          <Map
            ref={mapRef}
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
                lastKnownPosition?.longitude ||
                0,
              latitude:
                selectedListing?.latitude ||
                initialCoordinates?.latitude ||
                lastKnownPosition?.latitude ||
                0,
              zoom: selectedListing
                ? 12
                : initialCoordinates?.zoom || lastKnownPosition?.zoom || 1,
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

            {/* <Button>Open or close drawer</Button> */}
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
                >
                  <MapPin
                    selected={selectedPinId === listing.id} // Use selectedPinId instead of selectedListing
                    coarse={listing.type === "residential"}
                  />
                </Marker>
              </DrawerTrigger>
            ))}
          </Map>

          {/* Map search for small screens */}
          <MapSearch
            onPick={handleSearchPick}
            mapController={mapController}
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              zIndex: 0, // Setting the z-index of the map controls to 0 seems to fix the drawer content's touch responsiveness
            }}
          />

          {selectedListing && !isListingInView && (
            <button
              onClick={handleFlyToListing}
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "8px 16px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                zIndex: 1,
              }}
            >
              Return to listing
            </button>
          )}
        </>
      )}
    </div>
  );
}
