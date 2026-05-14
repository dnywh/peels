"use client";
import { theme } from "@/styles/theme.yak";
import {
  sharedMediaFrameBorderStyles,
  sharedMediaFrameRadius,
  sharedMediaFrameShapeStyles,
} from "@/styles/mediaFrame";
import { forwardRef, useMemo } from "react";

import Map, { AttributionControl, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLocale } from "next-intl";

import { styled } from "next-yak";
import type { ComponentProps, ReactNode } from "react";
import { handleMapError } from "@/features/map/lib/mapErrors";
import { createProtomapsStyle } from "@/features/map/lib/protomapsStyle";
import { usePreferredMapFlavor } from "@/features/map/hooks/usePreferredMapFlavor";

type MapThumbnailProps = {
  height?: number | string;
  children?: ReactNode;
} & Omit<ComponentProps<typeof Map>, "children" | "style" | "mapStyle">;

const MapContainer = styled.div`
  ${sharedMediaFrameShapeStyles}
  ${sharedMediaFrameBorderStyles}
  background-color: ${theme.colors.background.map};
  position: relative;
`;

const MapThumbnail = forwardRef<MapRef, MapThumbnailProps>(
  function MapThumbnail({ height = "300", children, ...props }, ref) {
    const locale = useLocale();
    const mapFlavor = usePreferredMapFlavor();
    const mapStyle = useMemo(
      () => createProtomapsStyle({ flavorName: mapFlavor, locale }),
      [locale, mapFlavor]
    );

    return (
      <MapContainer>
        <Map
          ref={ref}
          attributionControl={false} // Customised below
          mapStyle={mapStyle}
          onError={handleMapError}
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
);

export default MapThumbnail;
