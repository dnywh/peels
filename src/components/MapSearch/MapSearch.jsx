"use client";
import { useCallback, useEffect, useState, useRef } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)

// TODO: Add a 'required' prop for forms that require a location
function MapSearch({
  onPick,
  mapController,
  searchInputRef,
  countryCode,
  ...props
}) {
  return (
    <div style={props.style}>
      <GeocodingControl
        // Should be customizable via props:
        clearOnBlur={true}
        collapsed={true} // Visibly collapsed into square icon until hover or tap
        // Should be fixed:
        ref={searchInputRef ? searchInputRef : undefined}
        debounceSearch={250} // Default is 200
        apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
        // The below will be great for the map page where we don't want to bother with a country dropdown:
        mapController={mapController}
        // Otherwise I get funky results, like "melbourne" coming up with options in the USA
        // Only applies if control is tied to the map via mapController. See https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
        // I can't figure this out. See MapImmersive component
        proximity={[
          // { type: "map-center" }, // Doesn't seem to work without mapController
          { type: "server-geolocation" }, // The default, using as a backup
          // { type: "client-geolocation"}, // Too aggressive with permissions
        ]}
        // Limiting to country is a temporary solution until proximity feature is fixed: https://github.com/maptiler/maptiler-geocoding-control/issues/84
        // A better, but still temporary approach, would be to use the 'bounds' prop to limit the search to the map's bounds
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
        placeholder="Search"
        errorMessage="Something went wrong. Try again?"
        noResultsMessage="No results. Keep typing or refine your search"
        // showPlaceType={false}
        onPick={(event) => {
          onPick(event);
        }}
        // flyToSelected={true}
      />
    </div>
  );
}

export default MapSearch;
