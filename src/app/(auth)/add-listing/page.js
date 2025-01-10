'use client';
import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Field, Label, Radio, RadioGroup } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

import SubmitButton from '@/components/SubmitButton';
import Form from '@/components/Form';
import FormHeader from '@/components/FormHeader';
import { styled } from '@pigment-css/react'

// className="space-y-2"
const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
}))

const StyledRadio = styled(Radio)(({ theme }) => ({
    alignItems: 'center',
    padding: '1.25rem',
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    backgroundColor: theme.colors.radio.unchecked.background,
    borderRadius: theme.corners.base,
    border: `2px solid ${theme.colors.radio.unchecked.border}`,
    '&[data-checked]': {
        backgroundColor: theme.colors.radio.checked.background,
        border: `2px solid ${theme.colors.radio.checked.border}`,
        [`& ${StyledCheckCircleIcon}`]: {
            opacity: '1',
        },
    },
}))

const StyledRadioText = styled("div")(({ theme }) => ({
    flex: '1',

    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
}))

const StyledRadioTitle = styled("p")(({ theme }) => ({
    fontSize: '1.25rem',
    fontWeight: '500',
    lineHeight: '100%',
    color: theme.colors.text.primary,
}))

const StyledRadioDescription = styled("p")(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: 'normal',
    color: theme.colors.text.secondary,
}))

const StyledCheckCircleIcon = styled(CheckCircleIcon)(({ theme }) => ({
    // className="text-sm/6"
    // className="size-6 fill-white opacity-0 transition group-data-[checked]:opacity-100"
    opacity: '0',
    transition: 'opacity 0.2s ease-in-out',
    fill: theme.colors.text.primary,
    width: '1.5rem',
    height: '1.5rem',

}))

// TODO
// 1. This page shouldn't be accessible by guests (signed out users)
// 2. The button should route them to the the business form IF they select "My business donates food scraps"
// 3. The button should ask another question if they select "I accept food scraps"
// 4. In that #3 case, the next form's button should route them to the the residential form if they select "residential" or the commuity form if they select "Community place"
const listingTypes = [
    { key: 'accept', title: 'I accept food scraps', description: 'Others can arrange food scraps drop-off to your home or your community garden.' },
    { key: 'business', title: 'My business donates scraps', description: 'Others can pick up spent coffee from your cafe, hops from your brewery, or similar.' },
]

function NewListingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [selectedListingType, setSelectedListingType] = useState(null)
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


    function handleAccepterTypeChange(event) {
        setAccepterType(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        console.log(selectedListingType.key)

        // Navigate to appropriate form
        if (selectedListingType.key === 'business') {
            router.push(`/add-listing/form?type=${selectedListingType.key}`);
        } else if (selectedListingType.key === 'accept' && currentStep === 1) {
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
            <FormHeader action="back">
                <h1>Add a listing</h1>
                <p>What kind of listing?</p>
            </FormHeader>

            {currentStep === 1 ? (
                <>

                    <Form onSubmit={handleSubmit}>

                        <StyledRadioGroup
                            by="title"
                            value={selectedListingType}
                            onChange={setSelectedListingType}
                            aria-label="Listing type">
                            {listingTypes.map((option) => (
                                <StyledRadio
                                    key={option.key}
                                    value={option}
                                >
                                    <>
                                        <StyledRadioText>
                                            <StyledRadioTitle>{option.title}</StyledRadioTitle>
                                            <StyledRadioDescription>{option.description}</StyledRadioDescription>
                                        </StyledRadioText>
                                        <StyledCheckCircleIcon />
                                    </>
                                </StyledRadio>
                            ))}
                        </StyledRadioGroup>

                        <SubmitButton width="full" disabled={!selectedListingType}>
                            Continue
                        </SubmitButton>
                    </Form>
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
                        <SubmitButton width="full" >
                            Continue
                        </SubmitButton>
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
