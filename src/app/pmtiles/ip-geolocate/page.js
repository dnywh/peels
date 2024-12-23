'use client';
import { useEffect, useState, useRef, useCallback } from "react";
import Map, {
    NavigationControl,
    GeolocateControl,
    MapRef
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import layers from 'protomaps-themes-base';

// TODO: Choose sensible defaults
const initialViewState = {
    latitude: 40,
    longitude: -100,
    zoom: 5
};

export default function App() {
    const mapRef = useRef(null);

    useEffect(() => {
        // Initialize PMTiles protocol
        const protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        // Get location from IP
        // TODO: see if there is location data already set from local storage, and return that first if so
        // Perhaps do this on the homepage/first page loaded and then use that data for the map
        // And then store that data in local storage for future use in the same session/browser
        // Consider using that as the default view state for the map for next time (by saving it to Supabase)
        async function initializeLocation() {
            try {
                const response = await fetch('https://freeipapi.com/api/json/', {
                    signal: AbortSignal.timeout(3000) // 3 second timeout
                });


                if (!response.ok) throw new Error('IP lookup failed');
                const data = await response.json();

                if (data.latitude && data.longitude) {
                    mapRef.current?.flyTo({
                        center: [data.longitude, data.latitude],
                        duration: 0 // No animation
                    });
                }
            } catch (error) {
                // Fail silently - default view state will be used
                console.warn('Could not determine location from IP');
            }
        }

        initializeLocation();

        // Cleanup protocol
        return () => {
            maplibregl.removeProtocol("pmtiles");
        };
    }, []);

    return (
        <div>
            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '400px' }}
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
                <GeolocateControl
                    showUserLocation={true}
                    animationOptions={{ duration: 100 }}
                />
                <NavigationControl showZoom={true} showCompass={false} />
            </Map>
        </div>
    );
}
