'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import SubmitButton from '@/components/SubmitButton';
import Form from '@/components/Form';
import FormHeader from '@/components/FormHeader';
import RadioGroup from '@/components/RadioGroup';
import Radio from '@/components/Radio';

// TODO
// 1. This page shouldn't be accessible by guests (signed out users)
// 2. The button should route them to the the business form IF they select "My business donates food scraps"
// 3. The button should ask another question if they select "I accept food scraps"
// 4. In that #3 case, the next form's button should route them to the the residential form if they select "residential" or the commuity form if they select "Community place"
const listingTypes = [
    { key: 'accept', title: 'I accept food scraps', description: 'Others can arrange food scraps drop-off to your home or your community garden' },
    { key: 'business', title: 'My business donates scraps', description: 'Others can pick up spent coffee from your cafe, hops from your brewery, or similar' },
]

const accepterTypes = [
    { key: 'residential', title: 'At my home', description: 'I accept scraps at a residential address' },
    { key: 'community', title: 'At a community place', description: 'I manage a community garden or similar' },
]

function AddListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [selectedListingType, setSelectedListingType] = useState(null)
    const [selectedAccepterType, setSelectedAccepterType] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);


    // Sync state with the URL params
    useEffect(() => {
        const nextStep = searchParams.get('step')
        setCurrentStep(nextStep ? parseInt(nextStep) : 1)
        if (!nextStep) {
            setSelectedAccepterType(null)
        }
    }, [searchParams])

    function handleSubmit(event) {
        event.preventDefault();

        // Navigate to appropriate form
        if (selectedListingType.key === 'business') {
            router.push(`/add-listing/form?type=${selectedListingType.key}`);
        } else if (selectedListingType.key === 'accept' && currentStep === 1) {
            router.push('/add-listing?step=2');
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (selectedAccepterType.key === 'residential') {
                router.push(`/add-listing/form?type=${selectedAccepterType.key}`);
            } else if (selectedAccepterType.key === 'community') {
                router.push(`/add-listing/form?type=${selectedAccepterType.key}`);
            }
        }
    }

    return (
        <>
            <FormHeader action="back">
                {currentStep === 1 ? <h1>What kind of listing?</h1> : <h1>Where will you accept food scraps?</h1>}
            </FormHeader>

            {currentStep === 1 ? (
                <Form onSubmit={handleSubmit}>
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

                    <SubmitButton width="full" disabled={!selectedListingType}>
                        Continue
                    </SubmitButton>
                </Form>
            ) : (
                <Form onSubmit={handleSubmit}>
                    <RadioGroup
                        by="title"
                        value={selectedAccepterType}
                        onChange={setSelectedAccepterType}
                        aria-label="Listing type">
                        {accepterTypes.map((option) => (
                            <Radio
                                key={option.key}
                                value={option}
                                title={option.title}
                                description={option.description}
                            />
                        ))}
                    </RadioGroup>

                    <SubmitButton width="full" disabled={!selectedAccepterType}>
                        Continue
                    </SubmitButton>
                </Form>
            )}
        </>
    );
}

function AddListingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AddListingContent />
        </Suspense>
    );
}

export default AddListingPage;
