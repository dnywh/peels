'use client';
import { useState, useCallback, useMemo } from 'react';
import { usePlaceKit } from '@placekit/autocomplete-react';

const formatValue = (item) => item.name;

export default function AutoComplete() {
    const [suggestions, setSuggestions] = useState([]);

    const handleResults = useCallback((query, results) => {
        setSuggestions(prevSuggestions => {
            if (JSON.stringify(prevSuggestions) !== JSON.stringify(results)) {
                return results;
            }
            return prevSuggestions;
        });
    }, []);

    const handlePick = useCallback((value, item) => {
        console.log('Selected:', item);
    }, []);

    const options = useMemo(() => ({
        countries: ['fr'],
        maxResults: 10,
        formatValue,
        handlers: {
            results: handleResults,
            pick: handlePick
        }
    }), [handleResults, handlePick]);

    const { target } = usePlaceKit(
        `${process.env.NEXT_PUBLIC_PLACEKIT_API_KEY}`,
        options
    );

    return (
        <div className="relative w-full">
            <input
                ref={target}
                className="w-full p-2 border rounded"
                placeholder="Search places..."
            />

            {/* Show suggestions panel when there are results */}
            {suggestions.length > 0 && (
                <ul className="absolute w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((item) => (
                        <li
                            key={item.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            <div>{item.name}</div>
                            {item.city && (
                                <div className="text-sm text-gray-600">
                                    {item.city} {item.zipcode}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
