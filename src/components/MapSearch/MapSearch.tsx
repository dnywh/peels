"use client";

import type { ComponentType, CSSProperties, Ref } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)
import { useTranslations } from "next-intl";

type GeocodingPickEvent = {
  feature?: { center?: [number, number] };
};

type MapSearchProps = {
  onPick: (event: GeocodingPickEvent) => void;
  searchInputRef?: Ref<HTMLInputElement | null>;
  countryCode?: string | null;
  style?: CSSProperties;
};

const GeocodingControlComponent = GeocodingControl as ComponentType<{
  clearOnBlur?: boolean;
  collapsed?: boolean;
  ref?: Ref<HTMLInputElement | null>;
  debounceSearch?: number;
  apiKey?: string;
  proximity?: { type: string }[];
  country?: string | null;
  types?: string[];
  minLength?: number;
  placeholder?: string;
  errorMessage?: string;
  noResultsMessage?: string;
  onPick?: (event: GeocodingPickEvent) => void;
}>;

// TODO: Add a 'required' prop for forms that require a location
function MapSearch({
  onPick,
  searchInputRef,
  countryCode,
  style,
}: MapSearchProps) {
  const t = useTranslations("Map");

  return (
    <div style={style}>
      <GeocodingControlComponent
        clearOnBlur={true}
        collapsed={true} // Visibly collapsed into square icon until hover or tap
        ref={searchInputRef ?? undefined}
        debounceSearch={250} // Default is 200
        apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
        // Otherwise I get funky results, like "melbourne" coming up with options in the USA
        // Only applies if control is tied to the map via mapController. See
        // https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
        proximity={[{ type: "server-geolocation" }]}
        // Limiting to country is a temporary solution until proximity feature
        // is fixed: https://github.com/maptiler/maptiler-geocoding-control/issues/84
        country={countryCode}
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

export default MapSearch;
