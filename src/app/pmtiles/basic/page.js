'use client';
import { useEffect } from "react";
// import "./styles.css";
// import Map from "react-map-gl";
import Map, { Marker, ScaleControl, NavigationControl, AttributionControl, GeolocateControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from 'protomaps-themes-base';

import MapPin from '@/components/MapPin';

export default function App() {
    useEffect(() => {
        let protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {
            maplibregl.removeProtocol("pmtiles");
        };
    }, []);


    return (
        <div>
            <Map
                style={{ width: '100%', height: '100%' }}
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
                initialViewState={{
                    longitude: -122.4,
                    latitude: 37.8,
                    zoom: 14
                }}
                animationOptions={{ duration: 200 }}
            >
                {/* <ScaleControl /> */}
                <Marker longitude={-122.4} latitude={37.8} anchor="center" onClick={() => console.log("Tapped marker")}>
                    <MapPin size={28} />
                </Marker>
                <GeolocateControl showUserLocation={true} animationOptions={{ duration: 100 }} />
                <NavigationControl showZoom={true} showCompass={false} />

            </Map>
        </div>
    );
}
