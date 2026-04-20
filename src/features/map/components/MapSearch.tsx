"use client";

import type { CSSProperties } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css";
import { useTranslations } from "next-intl";

type GeocodingPickEvent = {
  feature?: { center?: [number, number] };
};

type MapSearchProps = {
  onPick: (event: GeocodingPickEvent) => void;
  countryCode?: string | null;
  style?: CSSProperties;
};

// TODO: Add a 'required' prop for forms that require a location
export default function MapSearch({
  onPick,
  countryCode,
  style,
}: MapSearchProps) {
  const t = useTranslations("Map");

  return (
    <div style={style}>
      <GeocodingControl
        clearOnBlur={true}
        collapsed={true} // Visibly collapsed into square icon until hover or tap
        debounceSearch={250} // Default is 200
        apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
        // Otherwise I get funky results, like "melbourne" coming up with options in the USA
        // Only applies if control is tied to the map via mapController. See
        // https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
        proximity={[{ type: "server-geolocation" }]}
        // Limiting to country is a temporary solution until proximity feature
        // is fixed: https://github.com/maptiler/maptiler-geocoding-control/issues/84
        country={countryCode ?? undefined}
        types={[
          "address",
          "place",
          "neighbourhood",
          "locality",
          "municipal_district",
          "municipality",
        ]}
        minLength={3}
        placeholder={t("searchPlaceholder")}
        errorMessage={t("searchError")}
        noResultsMessage={t("searchNoResults")}
        onPick={(event: GeocodingPickEvent) => {
          onPick(event);
        }}
      />
    </div>
  );
}
