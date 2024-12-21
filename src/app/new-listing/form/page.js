'use client'

import React from "react";
import BackButton from "@/components/BackButton";
import { useSearchParams } from 'next/navigation'

function NewListingFormPage() {
    const searchParams = useSearchParams()
    const listingType = searchParams.get('type')
    console.log(listingType)
    return (
        <main>
            <BackButton />
            <h2>Add a new {listingType} form</h2>
        </main>
    );
}

export default NewListingFormPage;
