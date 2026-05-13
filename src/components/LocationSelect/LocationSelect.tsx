"use client";
import { theme } from "@/styles/theme.yak";
import { useCallback, useEffect, useState, useRef } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { GeocodingFeature } from "@maptiler/client";

import { countries } from "@/data/countries";

import { Marker } from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";

import Select from "@/components/Select";

import MapThumbnail from "@/components/MapThumbnail";
import MapPin from "@/components/MapPin";
import GeocodingSearch, {
  type GeocodingSearchHandle,
} from "@/features/map/components/GeocodingSearch";
import { MapZoomControls } from "@/features/map/components/MapControls";

import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import InputHint from "@/components/InputHint";

import { styled } from "next-yak";
import { useTranslations } from "next-intl";

const InputHintComponent = InputHint as any;

const StyledFieldset = styled(Fieldset)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.forms.gap.field};
`;

const ZOOM_LEVEL = 16;

import { config, geocoding, geolocation } from "@maptiler/client";

// Reverse geocoding for legible location (area_name)
config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";

// const maptilerClient = new maptilersdk.Maptiler();

type Coordinates = {
  latitude: number;
  longitude: number;
};

type LocationSelectProps = {
  listingType: string;
  coordinates: Coordinates | null;
  setCoordinates: Dispatch<SetStateAction<Coordinates | null>>;
  countryCode: string;
  setCountryCode: Dispatch<SetStateAction<string>>;
  areaName: string;
  setAreaName: Dispatch<SetStateAction<string>>;
  initialPlaceholderText?: string;
  autoDetectCountry?: boolean;
  onLocationInteract?: () => void;
  error?: string;
};

async function getAreaName(
  longitude: number,
  latitude: number
): Promise<string> {
  const coordinates = await geocoding.reverse([longitude, latitude]);

  const features = coordinates.features as any[];

  if (!features || features.length === 0) {
    return "";
  }

  // Helper function to find feature by place type
  const findFeatureByType = (features: any[], types: string[]) => {
    return features.find((f) =>
      types.some(
        (type) =>
          f.place_type?.includes(type) &&
          // Some places are coming up as 'storage', with a correlation to prpoerties.osm:place_type being "unknown"
          // E.g. see Jo's listing in Fitzroy
          // Skip these
          f.properties[`osm:place_type`] !== "unknown"
      )
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
    areaName = features[0].place_name || "";
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
  autoDetectCountry = true,
  onLocationInteract,
  error,
}: LocationSelectProps) {
  const t = useTranslations();
  const mapRef = useRef<any>(null);
  const inputRef = useRef<GeocodingSearchHandle | null>(null);

  const [mapShown, setMapShown] = useState(coordinates ? true : false);
  const [placeholderText, setPlaceholderText] = useState(
    initialPlaceholderText || t("Listings.form.locationPlaceholder")
  );

  useEffect(() => {
    if (autoDetectCountry && !countryCode) {
      let isMounted = true; // Track if component is mounted

      const initializeLocation = async () => {
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
      };

      initializeLocation();

      // Cleanup function
      return () => {
        isMounted = false;
      };
    }
  }, [autoDetectCountry, countryCode, setCountryCode]);

  const handleCountryChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onLocationInteract?.();
      setCountryCode(e.target.value);
      console.log("Country changed, focusing input...");
      setMapShown(false);
      inputRef.current?.focus();
    },
    [onLocationInteract, setCountryCode]
  );

  const handleDragStart = useCallback(() => {
    inputRef.current?.blur(); // Close and blur the input if it's open
    console.log("handling drag start");
    inputRef.current?.setQuery("");
    setPlaceholderText(t("Listings.form.customLocation")); // Clear previous value
  }, [t]);

  const handleDragEnd = useCallback(
    async (event: any) => {
      console.log("Drag end. Location:", event.lngLat);
      onLocationInteract?.();

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
      setPlaceholderText(nextAreaName);
    },
    [onLocationInteract, setCoordinates, setAreaName]
  );

  const handlePick = useCallback(
    async (feature: GeocodingFeature) => {
      if (!feature.center) return;

      // Otherwise continue as normal
      console.log("Picked:", feature, feature.center);
      onLocationInteract?.();

      const nextCoordinates = {
        latitude: feature.center[1],
        longitude: feature.center[0],
      };

      // Get area name from coordinates
      const nextAreaName = await getAreaName(
        nextCoordinates.longitude,
        nextCoordinates.latitude
      );
      setAreaName(nextAreaName);
      inputRef.current?.setQuery(nextAreaName || feature.place_name);

      inputRef.current?.blur();

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
    [mapShown, coordinates, onLocationInteract, setCoordinates, setAreaName]
  );

  return (
    <StyledFieldset>
      <Field>
        <Label htmlFor="country">{t("Listings.form.location")}</Label>
        {/* TODO: Accessibility: label currently covers both select and geocoding control but not yet via htmlFor. Fix or make a separate visually hidden one for the geocoding control */}
        <Select
          id="country"
          value={countryCode ? countryCode : "initial"}
          onChange={handleCountryChange}
          required={true}
        >
          <option disabled={true} value="initial">
            {t("Listings.form.selectCountry")}
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>

        {/* TODO: Handle database error when user doesn't enter a location */}
        <GeocodingSearch
          ref={inputRef}
          id="autocomplete"
          ariaInvalid={error ? "true" : undefined}
          clearLabel={t("Map.searchClear")}
          countryCode={countryCode}
          error={error}
          errorMessage={t("Map.searchError")}
          inputTestId="listing-location-search-input"
          loadingMessage={t("Map.searchLoading")}
          noResultsMessage={t("Map.searchNoResults")}
          onPick={handlePick}
          placeholder={placeholderText}
        />
        <InputHintComponent variant={error ? "error" : undefined}>
          {error
            ? error
            : t("Listings.form.locationHint", {
                type: listingType,
              })}
        </InputHintComponent>
      </Field>

      {mapShown && coordinates && (
        <Field>
          {/* <p>Refine your pin location:</p> */}

          <MapThumbnail
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
            <MapZoomControls
              onZoomIn={() => mapRef.current?.getMap().zoomIn()}
              onZoomOut={() => mapRef.current?.getMap().zoomOut()}
              zoomInLabel={t("Map.zoomInControl")}
              zoomOutLabel={t("Map.zoomOutControl")}
            />
          </MapThumbnail>

          <InputHintComponent>
            {t("Listings.form.dragPinHint", {
              obscure: listingType === "residential" ? "true" : "false",
            })}
          </InputHintComponent>
        </Field>
      )}
    </StyledFieldset>
  );
}
