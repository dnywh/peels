"use client";
import { theme } from "@/styles/theme.yak";
import {
  sharedMediaFrameBorderStyles,
  sharedMediaFrameRadius,
  sharedMediaFrameShapeStyles,
} from "@/styles/mediaFrame";
import { useEffect, useMemo } from "react";

import Map, { AttributionControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useLocale } from "next-intl";

import { styled } from "next-yak";
import type { ComponentProps, ReactNode } from "react";
import { createProtomapsStyle } from "@/features/map/lib/protomapsStyle";
import { usePreferredMapFlavor } from "@/features/map/hooks/usePreferredMapFlavor";

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
  const locale = useLocale();
  const mapFlavor = usePreferredMapFlavor();
  const mapStyle = useMemo(
    () => createProtomapsStyle({ flavorName: mapFlavor, locale }),
    [locale, mapFlavor]
  );

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
        mapStyle={mapStyle}
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
