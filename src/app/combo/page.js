'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { PlaceKit } from '@placekit/autocomplete-react';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';
import { countries } from '@/data/countries';

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from 'protomaps-themes-base';

import MapPin from '@/components/MapPin';

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
    const [placekitClient, setPlacekitClient] = useState(null);

    const [countryCode, setCountryCode] = useState('');
    const [mapShown, setMapShown] = useState(false);
    const [viewState, setViewState] = useState({
        latitude: 0,
        longitude: 0,
        zoom: 3.5
    });
    const [placeholderText, setPlaceholderText] = useState('Your address or nearby');

    // Auto-select dropdown country based on IP
    useEffect(() => {
        const fetchLocation = async () => {
            const nextLocation = await initializeLocation(); // Await the promise
            console.log('nextLocation', nextLocation);
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
        setMapShown(false);
        if (placekitClient) {
            console.log('resetting placekitClient, removing map');
            placekitClient.clear();
        }
    }, [placekitClient]);

    const handleDragStart = useCallback(() => {
        if (placekitClient) {
            console.log('clearing placekitClient');
            setPlaceholderText('Custom location'); //TODO: use reverse geocoding to get something like "Suburb, City"
            placekitClient.setValue('');
        }
    }, [placekitClient]);

    const handlePick = useCallback(
        (value, item) => {
            console.log(item.lat, item.lng);
            const newLocation = {
                latitude: item.lat,
                longitude: item.lng,
                zoom: 12
            };

            // Only update viewState now, no need for markerPosition
            if (!mapShown) {
                console.log('Map not yet shown. Setting viewState to', newLocation);
                setViewState(newLocation);
                setMapShown(true);
            } else {
                console.log('flyTo', newLocation);
                mapRef.current?.flyTo({
                    center: [newLocation.longitude, newLocation.latitude],
                    duration: 2800
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

            <PlaceKit
                apiKey={process.env.NEXT_PUBLIC_PLACEKIT_API_KEY}
                options={{
                    panel: {
                        // className: 'panel-custom-class',
                        // offset: 4,
                        // strategy: 'absolute',
                        // flip: false,
                    },
                    format: {
                        // flag: (countrycode) => { },
                        // icon: (name, label) => { },
                        // sub: (item) => { },
                        // noResults: (query) => { },
                        // value: (item) => { item.lat },
                        value: (item) => `${item.name}, ${item.city}`,
                        // applySuggestion: 'Apply suggestion',
                        // cancel: 'Cancel',
                    },
                    // countryAutoFill: false,
                    // countrySelect: false,
                    // timeout: 5000,
                    // maxResults: 5,
                    // types: ['city'],
                    // language: 'fr',
                    countries: [countryCode],
                    // coordinates: '48.86,2.29',
                }}

                // event handlers (⚠️ use useCallback, see notes)
                onClient={setPlacekitClient}
                onPick={handlePick}

                // other HTML input props get forwarded
                // id="my-input"
                // name="address"
                placeholder={placeholderText}
            // placeholder="Your address or nearby"
            // disabled={true}
            // defaultValue="France"
            />

            {mapShown && (
                <>
                    <p>Refine your pin location:</p>
                    <Map
                        ref={mapRef}
                        initialViewState={viewState}
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
                    // mapLib={maplibregl}


                    // scrollZoom={true}
                    // doubleClickZoom={false}
                    // boxZoom={false}
                    // dragRotate={false}
                    // dragPan={true}
                    // keyboard={false}
                    // interactive={false} // ALl of the above in one


                    // maxBounds={bounds}
                    >
                        <Marker
                            draggable={true}
                            longitude={viewState.longitude}
                            latitude={viewState.latitude}
                            anchor="center"
                            onDragStart={handleDragStart}
                            onClick={() => console.log("Tapped marker")}
                        >
                            <MapPin size={28} />
                        </Marker>
                        {/* scrollZoom={false} */}
                        {/* <NavigationControl showZoom={true} showCompass={false} /> */}

                    </Map>
                </>
            )}
        </>
    );
};
