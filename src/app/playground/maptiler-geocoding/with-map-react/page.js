'use client'
import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { GeocodingControl } from "@maptiler/geocoding-control/react";
import { createMapLibreGlMapController } from "@maptiler/geocoding-control/maplibregl-controller";
import "@maptiler/geocoding-control/style.css";
import 'maplibre-gl/dist/maplibre-gl.css';
// import './map.css';

export default function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 139.753;
    const lat = 35.6844;
    const zoom = 14;
    const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    const [mapController, setMapController] = useState();

    useEffect(() => {
        if (map.current) return; // stops map from intializing more than once

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${API_KEY}`,
            center: [lng, lat],
            zoom: zoom
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        setMapController(createMapLibreGlMapController(map.current, maplibregl));

    }, [API_KEY, lng, lat, zoom]);

    return (
        <div className="map-wrap">
            <div className="geocoding">
                <GeocodingControl apiKey={API_KEY} mapController={mapController} />
            </div>
            <div ref={mapContainer} className="map" style={{ width: '100%', height: '500px' }} />
        </div>
    );
}
