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

export default function MapRender({
  mapRef,
  listings,
  selectedListing,
  onBoundsChange,
  isLoading,
  onMapClick,
  onMarkerClick,
  onSearchPick,
  setMapController,
}) {
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
  }, [onBoundsChange]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Add this flag to track initial load
    const isInitialLoad = !mapRef.current;

    // Only initialize IP-based location on initial load AND if no selected listing
    if (
      isInitialLoad &&
      !selectedListing?.latitude &&
      !selectedListing?.longitude
    ) {
      // Get location from IP
      // TODO: Use MapTiler's API and compare which returns faster
      // TODO: see if there is location data already set from local storage, and return that first if so
      // Perhaps do this on the homepage/first page loaded and then use that data for the map
      // And then store that data in local storage for future use in the same session/browser
      // Consider using that as the default view state for the map for next time (by saving it to Supabase)
      async function initializeLocation() {
        try {
          const response = await fetch("https://freeipapi.com/api/json/", {
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok) throw new Error("IP lookup failed");
          const data = await response.json();

          if (data.latitude && data.longitude) {
            mapRef.current?.flyTo({
              center: [data.longitude, data.latitude],
              zoom: 5,
              duration: 0, // No animation
            });
          }
        } catch (error) {
          // Fail silently - default view state will be used
          console.warn("Could not determine location from IP");
        }
      }
      initializeLocation();
    }

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []); // Empty dependency array since we only want this on mount

  // Set mapController to set relationship between MapSearch and MapRender
  // Can't get this to work, perhaps delete all mapController and createMapLibreGlMapController code if I can't get it working

  // useEffect(() => {
  //   if (mapRef.current) return; // stops map from intializing more than once

  //   setMapController(createMapLibreGlMapController(mapRef.current, maplibregl));
  // }, [onBoundsChange]);

  // TODO: low-priority: IF location is active AND it leaves the bounding box (i.e. user has moved the map), add a button to recenter (and zoom) map on selected listing

  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          backgroundColor: "lightblue",
        }}
      >
        {isLoading ? <LoadingSpinner /> : null}
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
            longitude: 0,
            latitude: 0,
            zoom: 1,
          }}
          animationOptions={{ duration: 200 }}
          onMoveEnd={handleMapMove}
          onLoad={handleMapLoad}
          onClick={onMapClick}
        >
          {listings.map((listing) => (
            <Marker
              key={listing.id}
              longitude={listing.longitude}
              latitude={listing.latitude}
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                onMarkerClick(listing.id);
              }}
            >
              <MapPin size={selectedListing?.id === listing.id ? 36 : 28} />
            </Marker>
          ))}
          <GeolocateControl
            showUserLocation={true}
            animationOptions={{ duration: 100 }}
          />
          <NavigationControl showZoom={true} showCompass={false} />
        </Map>
      </div>
    </>
  );
}
