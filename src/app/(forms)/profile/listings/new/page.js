'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import SubmitButton from '@/components/SubmitButton';
import Form from '@/components/Form';
import FormHeader from '@/components/FormHeader';
import RadioGroup from '@/components/RadioGroup';
import Radio from '@/components/Radio';

// export const metadata = {
//     title: 'New Listing',
// }

const listingTypes = [
    {
        key: 'host',
        title: 'I accept food scraps',
        description: 'Others can arrange food scraps drop-off to your home or your community garden'
    },
    {
        key: 'business',
        title: 'My business donates scraps',
        description: 'Others can pick up spent coffee from your cafe, hops from your brewery, or similar'
    },
]

const hostTypes = [
    { key: 'residential', title: 'At my home', description: 'I accept scraps at a residential address' },
    { key: 'community', title: 'At a community place', description: 'I manage a community garden or similar' },
]

function AddListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type');

    const [selectedListingType, setSelectedListingType] = useState(null);
    const [selectedHostType, setSelectedHostType] = useState(null);

    console.log('Current state:', { type, selectedListingType, selectedHostType });

    function handleSubmit(event) {
        event.preventDefault();

        // If we're on the host type selection page
        if (type === 'host') {
            if (!selectedHostType?.key) {
                console.warn('No host type selected');
                return;
            }
            router.push(`/profile/listings/new/${selectedHostType.key}`);
            return;
        }

        // If we're on the initial selection page
        if (!selectedListingType?.key) {
            console.warn('No listing type selected');
            return;
        }

        if (selectedListingType.key === 'business') {
            router.push(`/profile/listings/new/business`);
        } else if (selectedListingType.key === 'host') {
            router.push(`/profile/listings/new?type=host`);
        }
    }

    // Show different form based on URL type
    return (
        <>
            <FormHeader button="back">
                {type === 'host' ?
                    <h1>Where will you accept food scraps?</h1> :
                    <h1>What kind of listing?</h1>
                }
            </FormHeader>

            <Form onSubmit={handleSubmit}>
                {type === 'host' ? (
                    <RadioGroup
                        by="title"
                        value={selectedHostType}
                        onChange={setSelectedHostType}
                        aria-label="Host type">
                        {hostTypes.map((option) => (
                            <Radio
                                key={option.key}
                                value={option}
                                title={option.title}
                                description={option.description}
                            />
                        ))}
                    </RadioGroup>
                ) : (
                    <RadioGroup
                        by="title"
                        value={selectedListingType}
                        onChange={setSelectedListingType}
                        aria-label="Listing type">
                        {listingTypes.map((option) => (
                            <Radio
                                key={option.key}
                                value={option}
                                title={option.title}
                                description={option.description}
                            />
                        ))}
                    </RadioGroup>
                )}

                <SubmitButton width="full" disabled={type === 'host' ? !selectedHostType : !selectedListingType}>
                    Continue
                </SubmitButton>
            </Form>
        </>
    );
}

function AddListingPage() {
    return <Suspense fallback={<div>Loading...</div>}>
        <AddListingContent />
    </Suspense>;
}

export default AddListingPage;
