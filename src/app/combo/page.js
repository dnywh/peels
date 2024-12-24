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

    const [countryCode, setCountryCode] = useState('');
    const [mapShown, setMapShown] = useState(false);
    const [markerPosition, setMarkerPosition] = useState({
        longitude: -100,
        latitude: 40
    });
    const [viewState, setViewState] = useState({
        latitude: 40,
        longitude: -100,
        zoom: 3.5
    });

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

    const handlePick = useCallback(
        (value, item) => {
            console.log(item.lat, item.lng);
            const newLocation = {
                latitude: item.lat,
                longitude: item.lng,
                zoom: 12
            };

            // Update both viewState and marker position
            setMarkerPosition({
                longitude: newLocation.longitude,
                latitude: newLocation.latitude
            });

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
            }
        },
        [mapShown]
    );

    return (
        <>
            <p>Enter your address:</p>
            <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                <option disabled value=''>Select a country</option>
                {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
            </select>

            <PlaceKit
                apiKey={process.env.NEXT_PUBLIC_PLACEKIT_API_KEY}
                // geolocation={true} // hide "ask geolocation" button
                // className="your-custom-classes" // <div> wrapper custom classes

                // PlaceKit Autocomplete JS options
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
                onClient={(client) => { }}
                onOpen={() => { }}
                onClose={() => { }}
                onResults={(query, results) => { }}
                // onPick={(value, item, index) => { }}
                onPick={handlePick}

                onError={(error) => { }}
                onCountryChange={(item) => { }}
                onDirty={(bool) => { }}
                onEmpty={(bool) => { }}
                onFreeForm={(bool) => { }}
                onGeolocation={(bool, position) => { }}
                onCountryMode={(bool) => { }}
                onState={(state) => { }}

            // other HTML input props get forwarded
            // id="my-input"
            // name="address"
            // placeholder="Search places..."
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
                        interactive={false} // ALl of the above in one


                    // maxBounds={bounds}
                    >
                        <Marker
                            draggable={true}
                            longitude={markerPosition.longitude}
                            latitude={markerPosition.latitude}
                            anchor="center"
                            onClick={() => console.log("Tapped marker")}
                        >
                            <MapPin size={28} />
                        </Marker>
                        {/* scrollZoom={false} */}
                        <NavigationControl showZoom={true} showCompass={false} />

                    </Map>
                </>
            )}
        </>
    );
};
