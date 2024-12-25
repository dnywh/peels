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
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "maplibre-gl/dist/maplibre-gl.css";

import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";
import MapPin from "@/components/MapPin";

export default function MapRender({
  mapRef,
  listings,
  onBoundsChange,
  onMapClick,
  onMarkerClick,
  onSearchPick,
  setMapController,
}) {
  // Initial fetch when map loads
  const handleMapLoad = useCallback(() => {
    console.log("Map loaded");

    const bounds = mapRef.current.getMap().getBounds();
    console.log("Bounds:", bounds);
    onBoundsChange(bounds);
  }, [onBoundsChange]);

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
