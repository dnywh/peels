'use client'

import React, { Suspense } from "react";
import BackButton from "@/components/BackButton";
import { useSearchParams } from 'next/navigation'

function NewListingFormContent() {
    const searchParams = useSearchParams()
    const listingType = searchParams.get('type')
    return (
        <main>
            <BackButton />
            <h2>Add a new {listingType} form</h2>
        </main>
    )
}

function NewListingFormPage() {

    return (


        <Suspense fallback={<div>Loading...</div>}>
            <NewListingFormContent />
        </Suspense>

    );
}

export default NewListingFormPage;
