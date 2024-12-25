"use client";
import { useEffect, useState, useCallback, useRef } from "react";

import Map, {
  Marker,
  ScaleControl,
  NavigationControl,
  AttributionControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import MapPin from "@/components/MapPin";

export default function MapRender({
  listings,
  onBoundsChange,
  onMapClick,
  onMarkerClick,
}) {
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  // Initial fetch when map loads
  const handleMapLoad = useCallback(() => {
    console.log("Map loaded");
    setIsMapLoaded(true);
    const bounds = mapRef.current.getMap().getBounds();
    console.log("Bounds:", bounds);
    onBoundsChange(bounds);
  }, [onBoundsChange]);

  // Fetch on map move
  // TODO: Being called when user navigates to a different page and therefore causing an error as getMap() is null. This should be ignored map.
  const handleMapMove = useCallback(() => {
    if (!isMapLoaded || !mapRef.current) return; // Add check for mapRef.current
    console.log("MAP MOVED");
    const map = mapRef.current.getMap();
    if (!map) return; // Add safety check for map object
    const bounds = map.getBounds();
    onBoundsChange(bounds);
  }, [onBoundsChange, isMapLoaded]);

  const handleMapRemove = useCallback(() => {
    console.log("MAP REMOVED");
    setIsMapLoaded(false);
  }, []);

  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  useEffect(() => {
    // Cleanup function to reset the map loaded state on unmount
    return () => {
      handleMapRemove(); // Call the remove handler
    };
  }, [handleMapRemove]);

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
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 1,
      }}
      animationOptions={{ duration: 200 }}
      onMoveEnd={handleMapMove}
      onLoad={handleMapLoad}
      onIdle={console.log("IDLE")}
      onRemove={handleMapRemove}
      onClick={onMapClick}
    >
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          longitude={listing.longitude}
          latitude={listing.latitude}
          anchor="center"
          onClick={() => onMarkerClick(listing.id)}
        >
          <MapPin size={28} />
        </Marker>
      ))}
      <GeolocateControl
        showUserLocation={true}
        animationOptions={{ duration: 100 }}
      />
      <NavigationControl showZoom={true} showCompass={false} />
    </Map>
  );
}
