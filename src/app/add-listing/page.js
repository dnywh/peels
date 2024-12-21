'use client';
import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PeelsButton from '@/components/PeelsButton';
import BackButton from '@/components/BackButton/BackButton';


// TODO
// 1. This page shouldn't be accessible by guests (signed out users)
// 2. The button should route them to the the business form IF they select "My business donates food scraps"
// 3. The button should ask another question if they select "I accept food scraps"
// 4. In that #3 case, the next form's button should route them to the the residential form if they select "residential" or the commuity form if they select "Community place"


function NewListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [listingType, setListingType] = useState('');
    const [accepterType, setAccepterType] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    // Sync state with the URL params
    useEffect(() => {
        const nextStep = searchParams.get('step')
        setCurrentStep(nextStep ? parseInt(nextStep) : 1)
        if (!nextStep) {
            setAccepterType('')
        }
    }, [searchParams])

    function handleListingTypeChange(event) {
        setListingType(event.target.value);
    }

    function handleAccepterTypeChange(event) {
        setAccepterType(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (listingType === 'business') {
            router.push(`/add-listing/form?type=${listingType}`);
        } else if (listingType === 'accept' && currentStep === 1) {
            router.push('/add-listing?step=2');
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (accepterType === 'residential') {
                router.push(`/add-listing/form?type=${accepterType}`);
            } else if (accepterType === 'community') {
                router.push(`/add-listing/form?type=${accepterType}`);
            }
        }
    }

    return (
        <>
            <BackButton />

            <h1>Add a listing</h1>

            {currentStep === 1 ? (
                <>
                    <p>What kind of listing?</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="listingType"
                                    value="accept"
                                    checked={listingType === 'accept'}
                                    onChange={handleListingTypeChange}
                                />
                                <span className="text-lg font-medium">I accept food scraps</span>
                                <span className="text-sm text-muted-foreground">Others can arrange food scraps drop-off to your home or your community garden.</span>
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="listingType"
                                    value="business"
                                    checked={listingType === 'business'}
                                    onChange={handleListingTypeChange}
                                />
                                <span className="text-lg font-medium">My business donates food scraps</span>
                                <span className="text-sm text-muted-foreground">Others can pick up spent coffee from your cafe, hops from your brewery, or similar.</span>
                            </label>
                        </div>
                        <PeelsButton type="submit">
                            Continue
                        </PeelsButton>
                    </form>
                </>
            ) : (
                <>
                    <p>Where will you accept food scraps?</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="accepterType"
                                    value="residential"
                                    checked={accepterType === 'residential'}
                                    onChange={handleAccepterTypeChange}
                                />
                                <span className="text-lg font-medium">At my home</span>
                                <span className="text-sm text-muted-foreground">I accept scraps at a residential address</span>
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="accepterType"
                                    value="community"
                                    checked={accepterType === 'community'}
                                    onChange={handleAccepterTypeChange}
                                />
                                <span className="text-lg font-medium">At a community place</span>
                                <span className="text-sm text-muted-foreground">I manage a community garden or similar</span>
                            </label>
                        </div>
                        <PeelsButton type="submit">
                            Continue
                        </PeelsButton>
                    </form>
                </>
            )}
        </>
    );
}

function NewListingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewListingContent />
        </Suspense>
    );
}

export default NewListingPage;
