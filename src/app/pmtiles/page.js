'use client';
import { useEffect } from "react";
// import "./styles.css";
import Map from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

import layers from 'protomaps-themes-base';

export default function App() {
    useEffect(() => {
        let protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        return () => {
            maplibregl.removeProtocol("pmtiles");
        };
    }, []);


    return (
        <div className="App">
            <Map
                style={{ width: 600, height: 400 }}
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
                }
                }
                mapLib={maplibregl}
            />
        </div>
    );
}
