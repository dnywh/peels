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
import { publicIp } from 'public-ip';

const initialViewState = {
    latitude: 40,
    longitude: -100,
    zoom: 5
};

export default function App() {
    const mapRef = useRef(null);
    // const [viewState, setViewState] = useState({
    //     longitude: -122.4,
    //     latitude: 37.8,
    //     zoom: 5
    // });
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initialize PMTiles protocol
        const protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        // Get location from IP
        async function initializeLocation() {
            try {
                // todo: see if there is location data already set from local storage, and return that first if so
                const ip = await publicIp();
                const response = await fetch(`http://ip-api.com/json/${ip}`);
                const data = await response.json();

                if (data.status === 'success') {
                    // setTimeout(() => mapRef.current?.flyTo({ center: [data.lon, data.lat], duration: 0 }), 1000);
                    mapRef.current?.flyTo({ center: [data.lon, data.lat], duration: 0 });
                    // TODO: store this location in local storage for future use in the same session/browser

                }
            } catch (error) {
                console.error('Error getting location:', error);
                // Keep default viewState on error
            } finally {
                // setIsLoading(false);
            }
        }

        initializeLocation();

        // Cleanup protocol
        return () => {
            maplibregl.removeProtocol("pmtiles");
        };
    }, []);

    // if (isLoading) {
    //     return <div>Loading map...</div>;
    // }

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
