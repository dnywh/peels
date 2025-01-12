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
    const [currentStep, setCurrentStep] = useState(1);
    // const currentStep = searchParams.get('step') === '2' ? 2 : 1;

    // Initialize state from URL params
    const [selectedListingType, setSelectedListingType] = useState(null)
    const [selectedAccepterType, setSelectedAccepterType] = useState(null);

    // Modified useEffect to preserve state during navigation
    useEffect(() => {
        const nextStep = searchParams.get('step');
        const newStep = nextStep ? parseInt(nextStep) : 1;

        console.log('URL Change - Current state:', {
            step: newStep,
            selectedListingType,
            selectedAccepterType
        });

        setCurrentStep(newStep);

        // Only reset accepterType if we're going back to step 1
        if (newStep === 1) {
            setSelectedAccepterType(null);
        }
    }, [searchParams]);

    // Add debug logs to track state changes
    useEffect(() => {
        console.log('State Update:', {
            currentStep,
            selectedListingType,
            selectedAccepterType
        });
    }, [currentStep, selectedListingType, selectedAccepterType]);

    function handleSubmit(event) {
        event.preventDefault();

        if (currentStep === 1) {
            if (!selectedListingType?.key) {
                console.warn('No listing type selected');
                return;
            }

            if (selectedListingType.key === 'business') {
                router.push(`/add-listing/business`);
            } else if (selectedListingType.key === 'accept') {
                router.push('/add-listing?step=2');
            }
        } else if (currentStep === 2) {
            if (!selectedAccepterType?.key) {
                console.warn('No accepter type selected');
                return;
            }
            router.push(`/add-listing/${selectedAccepterType.key}`);
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
                        onChange={(value) => {
                            console.log('RadioGroup onChange value:', value);
                            setSelectedAccepterType(value);
                        }}
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
