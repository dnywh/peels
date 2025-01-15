"use client";
import { useCallback, useEffect, useState, useRef } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)

// TODO: Add a 'required' prop for forms that require a location
function MapSearch({ onPick, mapController, searchInputRef, ...props }) {
  return (
    <div style={props.style}>
      <GeocodingControl
        clearOnBlur={true}
        ref={searchInputRef ? searchInputRef : undefined}
        debounceSearch={250} // Default is 200
        apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
        // The below will be great for the map page where we don't want to bother with a country dropdown:
        mapController={mapController}
        // Otherwise I get funky results, like "melbourne" coming up with options in the USA
        // Only applies if control is tied to the map via mapController. See https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
        // I can't figure this out. See MapRender component
        proximity={[
          // { type: "map-center" }, // Doesn't seem to work without mapController
          { type: "server-geolocation" }, // The default, using as a backup
          // { type: "client-geolocation"}, // Too aggressive with permissions
        ]}
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
        // collapsed={true} // Visibly collapsed into square icon until hover or tap
        // country="au" // Could be used from prop that loads the map, if needed. Too aggressive, though
        // showPlaceType={false}
        onPick={(event) => {
          console.log("onPick", event);
          onPick(event);
        }}
        // flyToSelected={true}
        style={{
          fontSize: "26px",
        }}
      />
    </div>
  );
}

export default MapSearch;
