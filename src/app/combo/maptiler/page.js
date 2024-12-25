'use client';
import { useCallback, useEffect, useState, useRef } from 'react';

import { GeocodingControl } from "@maptiler/geocoding-control/react";
import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)
// import { PlaceKit } from '@placekit/autocomplete-react';
// import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';
import { countries } from '@/data/countries';

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from 'protomaps-themes-base';

import MapPin from '@/components/MapPin';

// TODO: use this to build a custom component around the core geocoding API, using my nice own components for input and dropdown
// https://docs.maptiler.com/cloud/api/geocoding/
async function basicCallToBuildCustomComponentAround() {
    try {
        const response = await fetch(`https://api.maptiler.com/geocoding/Zurich.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        console.log(data.query, data.features)
        return Response.json(data);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

basicCallToBuildCustomComponentAround()



// TODO: See if MapTiler's Geolocation API is faster
// https://docs.maptiler.com/client-js/geolocation/
async function initializeLocation() {
    try {
        const response = await fetch('https://freeipapi.com/api/json/', {
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });


        if (!response.ok) throw new Error('IP lookup failed');
        const data = await response.json();

        if (data.countryCode) {
            return data.countryCode;
        }
    } catch (error) {
        // Fail silently - default view state will be used
        console.warn('Could not determine location from IP');
    }
}



// React component
export default function Combo() {
    const mapRef = useRef(null);
    const inputRef = useRef(null);
    // const [placekitClient, setPlacekitClient] = useState(null);

    const [countryCode, setCountryCode] = useState('');
    const [mapShown, setMapShown] = useState(false);
    const [viewState, setViewState] = useState({
        latitude: 0,
        longitude: 0,
        zoom: 16
    });
    const [placeholderText, setPlaceholderText] = useState('Your address or nearby');

    // Auto-select dropdown country based on IP
    useEffect(() => {
        const fetchLocation = async () => {
            const nextLocation = await initializeLocation(); // Await the promise
            console.log('Automatically updated country to', nextLocation);
            setCountryCode(nextLocation);
        };

        fetchLocation(); // Call the async function
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
        console.log("Country changed, focusing input...")
        setMapShown(false);
        inputRef.current.focus()
    }, []);

    const handleDragStart = useCallback(() => {
        inputRef.current.blur() // Close and blur the input if it's open
        console.log("handling drag start")
        inputRef.current.setQuery('')
        setPlaceholderText('Custom location'); //TODO: use reverse geocoding to get something like "Suburb, City"

    }, []);

    const handleDragEnd = useCallback((event) => {
        console.log("Drag end. Location:", event.lngLat)

        const newLocation = {
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng,
            zoom: 14
        };

        setViewState(newLocation); // Unsure if this is needed. Might be helpful for form submission

    }, []);

    const handlePick = useCallback(
        (event) => {
            // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
            // Return early if that's the case
            if (!event.feature?.center) return;

            // Otherwise continue as normal
            console.log("Picked:", event, event.feature?.center);

            const newLocation = {
                latitude: event.feature?.center[1],
                longitude: event.feature?.center[0],
                zoom: 16
            };

            // Blur the input
            // placekitRef.current?.blur(); TODO
            inputRef.current.blur()

            // Only update viewState now, no need for markerPosition
            if (!mapShown) {
                // console.log('Map not yet shown. Setting viewState to', newLocation);
                console.log('Map isnt shown yet, coming now...')
                setViewState(newLocation);
                setMapShown(true);
            } else {
                console.log('Map already shown, flying from', viewState, 'to', newLocation);
                mapRef.current?.flyTo({
                    center: [newLocation.longitude, newLocation.latitude],
                    duration: 2800,
                    zoom: newLocation.zoom
                });
                setViewState(newLocation);
            }
        },
        [mapShown]
    );

    return (
        <>
            <p>Enter your address:</p>
            <select
                value={countryCode}
                onChange={handleCountryChange}
            >
                <option disabled value=''>Select a country</option>
                {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
            </select>

            <GeocodingControl
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
                types={["address", "place", "neighbourhood", "locality", "municipal_district", "municipality"]}
                placeholder={placeholderText}
                errorMessage="Error TODO"
                noResultsMessage="No results. Keep typing or refine your search"
                minLength={3}
                showPlaceType={false}
                onPick={handlePick}
            />


            {mapShown && (
                <>
                    <p>Refine your pin location:</p>
                    <Map
                        ref={mapRef}
                        initialViewState={viewState}
                        // maxBounds={bounds}
                        style={{ width: 600, height: 400 }}
                        mapStyle={{
                            version: 8,
                            glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
                            sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
                            sources: {
                                "protomaps": {
                                    type: "vector",
                                    url: `https://api.protomaps.com/tiles/v4.json?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`,
                                    attribution: '<a href="https://protomaps.com">Protomaps</a>'

                                }
                            },
                            layers: layers("protomaps", "light")
                        }}
                    >
                        <Marker
                            draggable={true}
                            longitude={viewState.longitude}
                            latitude={viewState.latitude}
                            anchor="center"
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onClick={() => console.log("Tapped marker")}
                        >
                            <MapPin size={28} />
                        </Marker>
                        <NavigationControl showZoom={true} showCompass={false} />
                    </Map>
                </>
            )}
        </>
    );
};
