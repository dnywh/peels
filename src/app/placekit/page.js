'use client';

import { PlaceKit } from '@placekit/autocomplete-react';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';


export default function AutoComplete() {
    return (
        <PlaceKit apiKey={process.env.NEXT_PUBLIC_PLACEKIT_API_KEY} />
    );
};
