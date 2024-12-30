"use client"


import { useSearchParams } from 'next/navigation';

import ListingForm from "@/components/ListingForm";

export default function EditListingPage() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('id')
    console.log("Slug:", slug);

    return (
        <div>
            <h1>Listing</h1>
            <p>Edit this listing</p>
            <ListingForm slug={slug} />
            {/* <h2>Email notifications</h2>
            <form>
                <SwitchToggle label="New messages" checked={true} />
                <p>Receive an email when someone messages you</p>
            </form> */}
        </div>
    );
}
