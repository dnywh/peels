'use client';
import { useCallback } from 'react';
import { PlaceKit } from '@placekit/autocomplete-react';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';


export default function AutoComplete() {
    // memoizing event handlers with useCallback
    const handlePick = useCallback(
        (value, item) => {
            console.log(item.coordinates);
        },
        []
    );

    return (
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
                // countries: ['fr'],
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
    );
};
