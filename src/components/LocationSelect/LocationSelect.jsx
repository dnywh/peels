"use client";
import { useCallback, useEffect, useState, useRef } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)
// import { PlaceKit } from '@placekit/autocomplete-react';
// import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';
import { countries } from "@/data/countries";

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from "protomaps-themes-base";

import MapPin from "@/components/MapPin";

const ZOOM_LEVEL = 16;

// TODO: use this to build a custom component around the core geocoding API, using my nice own components for input and dropdown
// https://docs.maptiler.com/cloud/api/geocoding/
async function basicCallToBuildCustomComponentAround() {
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/Zurich.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
    );
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    console.log(data.query, data.features);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

basicCallToBuildCustomComponentAround();

// TODO: See if MapTiler's Geolocation API is faster
// https://docs.maptiler.com/client-js/geolocation/
async function initializeLocation() {
  try {
    const response = await fetch("https://freeipapi.com/api/json/", {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) throw new Error("IP lookup failed");
    const data = await response.json();

    if (data.countryCode) {
      return data.countryCode;
    }
  } catch (error) {
    // Fail silently - default view state will be used
    console.warn("Could not determine location from IP");
  }
}

// React component
export default function LocationSelect({ coordinates, setCoordinates }) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  // const [placekitClient, setPlacekitClient] = useState(null);

  const [countryCode, setCountryCode] = useState(""); // TODO this needs to be saved in database to populate the edit state
  const [mapShown, setMapShown] = useState(coordinates ? true : false);
  const [placeholderText, setPlaceholderText] = useState(
    "Your street or nearby"
  );

  // Auto-select dropdown country based on IP
  useEffect(() => {
    const fetchCountryCode = async () => {
      const nextCountryCode = await initializeLocation(); // Await the promise
      console.log("Automatically updated country to", nextCountryCode);
      setCountryCode(nextCountryCode);
    };

    fetchCountryCode(); // Call the async function
  }, []);

  // Set up Protomap tiles protocol
  useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleCountryChange = useCallback((e) => {
    setCountryCode(e.target.value);
    console.log("Country changed, focusing input...");
    setMapShown(false);
    inputRef.current.focus();
  }, []);

  const handleDragStart = useCallback(() => {
    inputRef.current.blur(); // Close and blur the input if it's open
    console.log("handling drag start");
    inputRef.current.setQuery("");
    setPlaceholderText("Custom location"); //TODO: use reverse geocoding to get something like "Suburb, City"
  }, []);

  const handleDragEnd = useCallback((event) => {
    console.log("Drag end. Location:", event.lngLat);

    const nextCoordinates = {
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    };

    setCoordinates(nextCoordinates); // Unsure if this is needed. Might be helpful for form submission
  }, []);

  const handlePick = useCallback(
    (event) => {
      // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
      // Return early if that's the case
      if (!event.feature?.center) return;

      // Otherwise continue as normal
      console.log("Picked:", event, event.feature?.center);

      const nextCoordinates = {
        latitude: event.feature?.center[1],
        longitude: event.feature?.center[0],
      };

      // Blur the input
      inputRef.current.blur();

      // Only update coordinates now, no need for markerPosition
      if (!mapShown) {
        // console.log('Map not yet shown. Setting coordinates to', nextCoordinates);
        console.log("Map isnt shown yet, coming now...");
        setCoordinates(nextCoordinates);
        setMapShown(true);
      } else {
        console.log(
          "Map already shown, flying from",
          coordinates,
          "to",
          nextCoordinates
        );
        mapRef.current?.flyTo({
          center: [nextCoordinates.longitude, nextCoordinates.latitude],
          duration: 2800,
          zoom: ZOOM_LEVEL,
        });
        setCoordinates(nextCoordinates);
      }
    },
    [mapShown]
  );

  return (
    <>
      {coordinates && <p>Coordinates provided, show map</p>}
      <label htmlFor="country">Location</label>
      {/* TODO: Accessibility: label currently covers both select and geocoding control but not yet via htmlFor. Fix or make a separate visually hidden one for the geocoding control */}
      <select id="country" value={countryCode} onChange={handleCountryChange}>
        <option disabled value="">
          Select a country
        </option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>

      {/* TODO: Reuse MapSearch component */}
      <GeocodingControl
        id="autocomplete" // Doesn't work out of the box
        ref={inputRef}
        apiKey={process.env.NEXT_PUBLIC_MAPTILER_API_KEY}
        country={countryCode}
        // The below will be great for the map page where we don't want to bother with a country dropdown:
        // Only applies if control is tied to a map. See https://docs.maptiler.com/sdk-js/modules/geocoding/api/types/#ProximityRule
        // proximity={[
        //     // { type: "map-center", minZoom: 12 },
        //     { type: "client-geolocation", minZoom: 8 },
        //     // { type: "server-geolocation", minZoom: 8 },
        // ]}
        types={[
          "address",
          "place",
          "neighbourhood",
          "locality",
          "municipal_district",
          "municipality",
        ]}
        placeholder={placeholderText}
        errorMessage="Error TODO"
        noResultsMessage="No results. Keep typing or refine your search"
        minLength={3}
        showPlaceType={false}
        onPick={handlePick}
      />

      {mapShown && (
        <>
          {/* <p>Refine your pin location:</p> */}
          <Map
            ref={mapRef}
            initialViewState={{ ...coordinates, zoom: ZOOM_LEVEL }}
            // maxBounds={bounds}
            style={{ width: 600, height: 400 }}
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
          >
            <Marker
              draggable={true}
              longitude={coordinates.longitude}
              latitude={coordinates.latitude}
              anchor="center"
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => console.log("Tapped marker")}
            >
              <MapPin size={28} />
            </Marker>
            <NavigationControl showZoom={true} showCompass={false} />
          </Map>
          {/* TODO: Make the following conditionally show for individual hosts only */}
          {/* Marker should show this visually, like Airbnb */}
          <p>
            Your location will be roughened to a 100m radius for your privacy.
            That makes it People will need to ask you for your address.
          </p>
        </>
      )}
    </>
  );
}
