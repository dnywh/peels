"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Map from "react-map-gl";
import { Protocol } from "pmtiles";
import maplibregl from "maplibre-gl";
// import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "maplibre-gl/dist/maplibre-gl.css";

import layers from "protomaps-themes-base";

function StyledMap({ children, ...props }) {
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    console.log("StyledMap mounted");

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);
  return (
    <Map
      {...props}
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
      animationOptions={{ duration: 200 }}
    >
      {children}
    </Map>
  );
}

export default StyledMap;
