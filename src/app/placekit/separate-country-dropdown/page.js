'use client';
import { useCallback, useEffect, useState } from 'react';
import { PlaceKit } from '@placekit/autocomplete-react';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

import { countries } from '@/data/countries';

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

export default function AutoComplete() {
    const [countryCode, setCountryCode] = useState('');

    // memoizing event handlers with useCallback
    const handlePick = useCallback(
        (value, item) => {
            console.log(item.coordinates);
        },
        []
    );

    useEffect(() => {
        const fetchLocation = async () => {
            const nextLocation = await initializeLocation(); // Await the promise
            console.log('nextLocation', nextLocation);
            setCountryCode(nextLocation);
        };

        fetchLocation(); // Call the async function
    }, []);

    return (
        <>
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
                        // value: (item) => { },
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
        </>
    );
};
