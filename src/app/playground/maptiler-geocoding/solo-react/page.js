'use client';
import { GeocodingControl } from "@maptiler/geocoding-control/react";
// import "@maptiler/geocoding-control/style.css"; // TODO REMOVE (TURN ON AND OFF TO PREVIEW STYLES)
// import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css'

export default function MaptilerGeocoding() {
    const API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

    return (
        <div className="geocoding-container wrapper">
            <GeocodingControl

                apiKey={API_KEY}
                country="au"
                types={["address", "place", "neighbourhood", "locality", "municipal_district", "municipality"]}
                placeholder="Foo bar"
                errorMessage="Error TODO"
                noResultsMessage="No results TODO"
                minLength={3}
                // iconsBaseUrl={`https://cdn.maptiler.com/maptiler-geocoding-control/v${version}/icons/`}
                // marker={true}

                showPlaceType={false}

                // proximity: [{ type: "map-center" }], // resoults closer to map center will be shown first

                // clearOnBlur={true}

                onPick={(evt) => console.log("Picked:", evt.feature?.center)}



            />

            {/* TODO:
            ✓ I should be able to remove or at least consistentize image (iconsBaseUrl)
            ✓ I should be able to put all text on one line (I know I can via CSS)
            - Less strict on no-results e.g. after a few characters

            0. Push initial location to map
            1. Filled value should clear after external event (map pin moved)
            2. Placeholder text should at that time also change ("Custom location")
            3. New location should trigger a new flyTo to map and update marker position
            */}

        </div>
    );
}


// TODO: hide image...
// <ul class="options svelte-bz0zu3"><li tabindex="0" data-selected="true" class="svelte-ltkwvy selected"><img src="street.svg" alt="address" class="svelte-ltkwvy"> <span class="texts svelte-ltkwvy"><span class="svelte-ltkwvy"><span class="primary svelte-ltkwvy">Seaview Road</span> <span class="secondary svelte-ltkwvy">address</span></span> <span class="line2 svelte-ltkwvy">Mount Cotton, Greater Brisbane Queensland 4165, Australia</span></span></li></ul>
