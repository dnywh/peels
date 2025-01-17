"use client";
import { useCallback, useEffect, useState, useRef } from "react";

import { GeocodingControl } from "@maptiler/geocoding-control/react";
// import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)

import { countries } from "@/data/countries";

import { Marker, NavigationControl } from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";

import Select from "@/components/Select";

import PeelsMap from "@/components/PeelsMap";
import MapPin from "@/components/MapPin";

import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import InputHint from "@/components/InputHint";

import { styled } from "@pigment-css/react";

const StyledFieldset = styled(Fieldset)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.forms.gap.field,
}));

const StyledMapWrapper = styled("div")(({ theme }) => ({
  borderRadius: `calc(${theme.corners.base} * 0.5)`,
  border: `1.5px solid ${theme.colors.border.stark}`,
  background: theme.colors.background.map,
  overflow: "hidden",
}));

const ZOOM_LEVEL = 16;

import { config, geocoding, geolocation } from "@maptiler/client";

// Reverse geocoding for legible location (area_name)
config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

// const maptilerClient = new maptilersdk.Maptiler();

async function getAreaName(longitude, latitude) {
  // const result = await maptilersdk.geocoding.reverse([6.249638, 46.402056]);
  // console.log({ result });
  // config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const coordinates = await geocoding.reverse([longitude, latitude]);

  const features = coordinates.features;
  console.log({ features });

  if (!features || features.length === 0) {
    return undefined;
  }

  // Helper function to find feature by place type
  const findFeatureByType = (features, types) => {
    return features.find((f) =>
      types.some((type) => f.place_type?.includes(type))
    );
  };

  // Look for features in order of specificity
  const neighbourhood = findFeatureByType(features, ["neighbourhood"]);
  const place = findFeatureByType(features, ["place"]);
  const municipality = findFeatureByType(features, ["municipality"]);
  const region = findFeatureByType(features, ["region"]);
  const country = findFeatureByType(features, ["country"]);
  const marine = findFeatureByType(features, ["continental_marine"]);

  let areaName = "";

  // Build location string based on available information

  if (place) {
    areaName = place.text;
    // } else if (place && region) {
    //   areaName = `${place.text}, ${region.text}`;
    // } else if (municipality && region) {
    //   areaName = `${municipality.text}, ${region.text}`;
  } else if (neighbourhood) {
    areaName = neighbourhood.text;
  } else if (municipality) {
    areaName = municipality.text;
  } else if (region) {
    areaName = region.text;
  } else if (country) {
    areaName = country.text;
  } else if (marine) {
    areaName = marine.text;
  } else {
    // Fallback to the most relevant feature's place name
    areaName = features[0].place_name || undefined;
  }
  return areaName;
}

// TODO: use this to build a custom component around the core geocoding API, using my nice own components for input and dropdown
// https://docs.maptiler.com/cloud/api/geocoding/
// async function basicCallToBuildCustomComponentAround() {
//   try {
//     const response = await fetch(
//       `https://api.maptiler.com/geocoding/Zurich.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
//     );
//     if (!response.ok) throw new Error("API request failed");
//     const data = await response.json();
//     console.log(data.query, data.features);
//     return Response.json(data);
//   } catch (error) {
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// }
// basicCallToBuildCustomComponentAround();

// React component
export default function LocationSelect({
  listingType,
  coordinates,
  setCoordinates,
  countryCode,
  setCountryCode,
  areaName,
  setAreaName,
  initialPlaceholderText,
  error,
}) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  const [mapShown, setMapShown] = useState(coordinates ? true : false);
  const [placeholderText, setPlaceholderText] = useState(
    initialPlaceholderText || "Your street name or nearby"
  );

  useEffect(() => {
    if (!countryCode) {
      let isMounted = true; // Track if component is mounted

      async function initializeLocation() {
        try {
          const response = await geolocation.info();

          // Only update state if component is still mounted and user hasn't changed the value
          if (isMounted && !countryCode && response?.country_code) {
            console.log("Updating to detected country:", response.country_code);
            setCountryCode(response.country_code);
          }
        } catch (error) {
          console.warn("Could not detect country from IP:", error);
          // No fallback needed - keep initial selection
        }
      }

      initializeLocation();

      // Cleanup function
      return () => {
        isMounted = false;
      };
    }
  }, [countryCode, setCountryCode]);

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

  const handleDragEnd = useCallback(
    async (event) => {
      console.log("Drag end. Location:", event.lngLat);

      const nextCoordinates = {
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      };

      setCoordinates(nextCoordinates); // Unsure if this is needed. Might be helpful for form submission

      const nextAreaName = await getAreaName(
        nextCoordinates.longitude,
        nextCoordinates.latitude
      );
      setAreaName(nextAreaName);
    },
    [setCoordinates, setAreaName]
  );

  const handlePick = useCallback(
    async (event) => {
      // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
      // Return early if that's the case
      if (!event.feature?.center) return;

      // Otherwise continue as normal
      console.log("Picked:", event, event.feature?.center);

      const nextCoordinates = {
        latitude: event.feature?.center[1],
        longitude: event.feature?.center[0],
      };

      // Get area name from coordinates
      const nextAreaName = await getAreaName(
        nextCoordinates.longitude,
        nextCoordinates.latitude
      );
      setAreaName(nextAreaName);

      inputRef.current.blur();

      if (!mapShown) {
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
    [mapShown, coordinates, setCoordinates, setAreaName]
  );

  return (
    <StyledFieldset>
      <Field>
        <Label htmlFor="country">Location</Label>
        {/* TODO: Accessibility: label currently covers both select and geocoding control but not yet via htmlFor. Fix or make a separate visually hidden one for the geocoding control */}
        <Select
          id="country"
          value={countryCode ? countryCode : "initial"}
          onChange={handleCountryChange}
          required={true}
        >
          <option disabled={true} value="initial">
            Select a country
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>

        {/* TODO: Reuse MapSearch component */}
        {/* TODO: Add a 'required' prop for forms that require a location (doesn't work with GeocodingControl) */}
        {/* TODO: Handle database error when user doesn't enter a location */}
        <div
          id="custom-geocoding-styles"
          className={error ? "error" : undefined}
        >
          <GeocodingControl
            // Add these two props to the custom component
            error={error}
            aria-invalid={error ? "true" : undefined}
            // Continue with actual props
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
            errorMessage="Something went wrong. Try again?"
            noResultsMessage="No results. Keep typing or refine your search"
            minLength={3}
            showPlaceType={false}
            onPick={handlePick}
            // Testing...
            required={true}
          />
        </div>
        <InputHint variant={error ? "error" : undefined}>
          {error
            ? error
            : `Start typing, then select one of the suggested ${listingType === "residential" ? "options" : "addresses"} from the dropdown.`}
        </InputHint>
      </Field>

      {mapShown && (
        <Field>
          {/* <p>Refine your pin location:</p> */}
          <StyledMapWrapper>
            <PeelsMap
              ref={mapRef}
              initialViewState={{ ...coordinates, zoom: ZOOM_LEVEL }}
              height={`35dvh`}
              // Allow interaction but just disable the input handlers that collide with the overall form experience (i.e. scrolling)
              // dragRotate={false}
              // dragPan={false}
              scrollZoom={false}
              // doubleClickZoom={false}
              // boxZoom={false}
              // cursor="default"
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
                <MapPin type={listingType} selected={true} />
              </Marker>
              <NavigationControl showZoom={true} showCompass={false} />
            </PeelsMap>
          </StyledMapWrapper>
          <InputHint>
            Drag the pin to refine{" "}
            {listingType === "residential" && "or obscure"} your location.
          </InputHint>
        </Field>
      )}
    </StyledFieldset>
  );
}
