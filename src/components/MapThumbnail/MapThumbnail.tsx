"use client";
import { theme } from "@/styles/theme.yak";
import {
  sharedMediaFrameBorderStyles,
  sharedMediaFrameRadius,
  sharedMediaFrameShapeStyles,
} from "@/styles/mediaFrame";
import { useEffect, useState, useCallback, useRef } from "react";

import Map, { AttributionControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from "protomaps-themes-base";

import { styled } from "next-yak";
import type { ComponentProps, ReactNode } from "react";

const MapContainer = styled.div`
  ${sharedMediaFrameShapeStyles}
  ${sharedMediaFrameBorderStyles}
  background-color: ${theme.colors.background.map};
  position: relative;
`;

export default function MapThumbnail({
  height = "300",
  children,
  ...props
}: {
  height?: number | string;
  children?: ReactNode;
} & Omit<ComponentProps<typeof Map>, "children" | "style" | "mapStyle">) {
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
        attributionControl={false} // Customised below
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
          layers: (layers as any)("protomaps", "light"),
        }}
        renderWorldCopies={true}
        style={{
          width: "100%",
          height: height,
          borderRadius: sharedMediaFrameRadius,
        }}
        {...props}
      >
        <AttributionControl compact={true} />
        {children}
      </Map>
    </MapContainer>
  );
}
