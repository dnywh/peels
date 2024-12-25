"use client";
import { useCallback, useEffect, useState, useRef } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)

function MapSearch({ onPick, mapController }) {
  return (
    <GeocodingControl
      // ref={inputRef}
      apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
      // The below will be great for the map page where we don't want to bother with a country dropdown:
      mapController={mapController}
      // Only applies if control is tied to the map via mapController. See https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
      // I can't figure this out. See MapRender component
      proximity={[
        { type: "map-center", minZoom: 12 },
        { type: "client-geolocation", minZoom: 8 },
        // { type: "server-geolocation", minZoom: 8 },
      ]}
      types={[
        "address",
        "place",
        "neighbourhood",
        "locality",
        "municipal_district",
        "municipality",
      ]}
      placeholder="Search the map..."
      errorMessage="Error TODO"
      noResultsMessage="No results. Keep typing or refine your search"
      minLength={3}
      showPlaceType={false}
      onPick={onPick}
    />
  );
}

export default MapSearch;
