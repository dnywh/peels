'use client';
import { useEffect, useState, useCallback } from "react";
// import "./styles.css";
// import Map from "react-map-gl";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from 'protomaps-themes-base';

import MapPin from '@/components/MapPin';
// import {MarkerDragEvent, LngLat} from 'react-map-gl';

const initialViewState = {
    latitude: 40,
    longitude: -100,
    zoom: 3.5
};

export default function App() {
    const [marker, setMarker] = useState({
        latitude: 40,
        longitude: -100
    });

    useEffect(() => {
        let protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {
            maplibregl.removeProtocol("pmtiles");
        };
    }, []);

    const onMarkerDrag = useCallback((event) => {
        setMarker({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        });

        console.log(event.lngLat.lng, event.lngLat.lat)
    }, []);


    return (
        <div className="App">
            <Map
                style={{ width: '100%', height: 400 }}
                initialViewState={initialViewState}
                mapStyle={{
                    version: 8,
                    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
                    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
                    sources: {
                        "protomaps": {
                            type: "vector",
                            url: `https://api.protomaps.com/tiles/v4.json?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`,
                            //       ^-- Remember to prefix the URL with pmtiles://
                            attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
                        }
                    },
                    layers: layers("protomaps", "light")
                }}
            // mapLib={maplibregl}


            >
                <Marker
                    longitude={marker.longitude}
                    latitude={marker.latitude}
                    anchor="bottom"
                    draggable
                    onDrag={onMarkerDrag}
                >
                    <MapPin />
                </Marker>
            </Map>
        </div>
    );
}
