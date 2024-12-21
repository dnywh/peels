'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import PeelsButton from '@/components/PeelsButton';
import BackButton from '@/components/BackButton/BackButton';
// TODO
// 1. This page shouldn't be accessible by guests (signed out users)
// 2. The button should route them to the the business form IF they select "My business donates food scraps"
// 3. The button should ask another question if they select "I accept food scraps"
// 4. In that #3 case, the next form's button should route them to the the personal form if they select "Home" or the commuity form if they select "Community place"


function NewListingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [listingType, setListingType] = useState(searchParams.get('type') || '');
    const [hostType, setHostType] = useState(searchParams.get('hostType') || '');
    const [currentStep, setCurrentStep] = useState(Number(searchParams.get('step')) || 1);

    function handleListingTypeChange(event) {
        setListingType(event.target.value);
    }

    function handleHostTypeChange(event) {
        setHostType(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (listingType === 'business') {
            router.push('/new-listing/business');
        } else if (listingType === 'host' && currentStep === 1) {
            // Update URL with state when moving to step 2
            router.push(`/new-listing?step=2&type=${listingType}`);
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (hostType === 'home') {
                router.push('/new-listing/personal');
            } else if (hostType === 'community') {
                router.push('/new-listing/community');
            }
        }
    }

    // Handle back button for step 2
    const handleBack = () => {
        if (currentStep === 2) {
            router.push('/new-listing'); // Go back to step 1
            setCurrentStep(1);
            setHostType('');
        }
    };

    return (
        <>
            <BackButton onClick={currentStep === 2 ? handleBack : undefined} />

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
                                    value="host"
                                    checked={listingType === 'host'}
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
                                    name="hostType"
                                    value="home"
                                    checked={hostType === 'home'}
                                    onChange={handleHostTypeChange}
                                />
                                <span className="text-lg font-medium">At my home</span>
                                <span className="text-sm text-muted-foreground">I'll accept scraps at my residential address</span>
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="hostType"
                                    value="community"
                                    checked={hostType === 'community'}
                                    onChange={handleHostTypeChange}
                                />
                                <span className="text-lg font-medium">At a community place</span>
                                <span className="text-sm text-muted-foreground">I manage a community garden or similar location</span>
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

export default NewListingPage;
