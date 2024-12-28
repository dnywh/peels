"use client";
import { useEffect, useCallback, memo } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "maplibre-gl/dist/maplibre-gl.css";

import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import MapPin from "@/components/MapPin";

// Memoize the MapRender component
const MapRender = memo(function MapRender({
  mapRef,
  listings,
  selectedListing,
  onBoundsChange,
  onMapClick,
  onMarkerClick,
  onSearchPick,
  setMapController,
}) {
  console.log("MapRender rendered");
  const handleMapLoad = useCallback(() => {
    const bounds = mapRef.current.getMap().getBounds();
    onBoundsChange(bounds);
  }, [onBoundsChange]);

  const handleMapMove = useCallback(() => {
    if (!mapRef.current?.getMap()) return;
    const bounds = mapRef.current.getMap().getBounds();
    onBoundsChange(bounds);
  }, [onBoundsChange]);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Get location from IP
    // TODO: Use MapTiler's API and compare which returns faster
    // TODO: see if there is location data already set from local storage, and return that first if so
    // Perhaps do this on the homepage/first page loaded and then use that data for the map
    // And then store that data in local storage for future use in the same session/browser
    // Consider using that as the default view state for the map for next time (by saving it to Supabase)
    async function initializeLocation() {
      try {
        const response = await fetch("https://freeipapi.com/api/json/", {
          signal: AbortSignal.timeout(3000), // 3 second timeout
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

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // Set mapController to set relationship between MapSearch and MapRender
  // Can't get this to work, perhaps delete all mapController and createMapLibreGlMapController code if I can't get it working

  // useEffect(() => {
  //   if (mapRef.current) return; // stops map from intializing more than once

  //   setMapController(createMapLibreGlMapController(mapRef.current, maplibregl));
  // }, [onBoundsChange]);

  // TODO: low-priority: IF location is active AND it leaves the bounding box (i.e. user has moved the map), add a button to recenter (and zoom) map on selected listing

  return (
    <Map
      ref={mapRef}
      style={{ width: "100%", height: "400px" }}
      mapStyle={{
        version: 8,
        glyphs:
          "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
        sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
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
      touchPitch={false}
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
          onClick={(e) => {
            e.originalEvent.stopPropagation(); // Prevent map click from interfering with marker click
            onMarkerClick(listing.id);
          }}
        >
          <MapPin size={28} isSelected={selectedListing?.id === listing.id} />
        </Marker>
      ))}
      <GeolocateControl
        showUserLocation={true}
        animationOptions={{ duration: 100 }}
      />
      <NavigationControl showZoom={true} showCompass={false} />
    </Map>
  );
});

MapRender.displayName = "MapRender";

export default MapRender;
