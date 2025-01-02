'use client'
import { useEffect, useRef } from "react";
import { GeocodingControl } from "@maptiler/geocoding-control/vanilla";
import "@maptiler/geocoding-control/style.css";

export default function MaptilerGeocoding() {
    const containerRef = useRef(null);

    useEffect(() => {
        const gc = new GeocodingControl({
            apiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY,
            target: containerRef.current
        });

        gc.addEventListener("pick", (evt) => {
            console.log("Selected location:", evt.detail);
        });

        return () => {
            gc.remove();
        };
    }, []);

    return (
        <div ref={containerRef} className="geocoding-container"></div>
    );
}
