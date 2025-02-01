"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Map from "react-map-gl/maplibre";

import maplibregl from "maplibre-gl";
// import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "maplibre-gl/dist/maplibre-gl.css";

import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";

import { styled } from "@pigment-css/react";

const RADIUS = "0.375rem";

const MapContainer = styled("div")(({ theme }) => ({
  borderRadius: RADIUS,
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  backgroundColor: theme.colors.background.map,
  position: "relative",
}));

//  Could use mixBlendMode: "multiply" on parent but that requires managing a white background fill
// So instead setting a separate border div with the same dimensions
const MapBorder = styled("div")(({ theme }) => ({
  borderRadius: RADIUS,
  boxShadow: `0 0 0 2px ${theme.colors.border.elevated} inset`,
  width: "100%",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 0,
  pointerEvents: "none", // Important, so map contents (i.e. pin(s)) can be interacted with
}));

export default function MapThumbnail({ height = `300`, children, ...props }) {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  return (
    <MapContainer>
      <Map
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
        style={{ width: "100%", height: height, borderRadius: RADIUS }}
        {...props}
      >
        {children}
      </Map>
      <MapBorder />
    </MapContainer>
  );
}
