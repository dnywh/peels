import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'

import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

import { getListingDisplayName } from "@/utils/listing";

const StyledMain = styled("main")({
    flex: 1, // Should be shared with layout used by Profile and Listings pages
    margin: "2rem auto",  // Should be shared with layout used by Profile and Listings pages
    maxWidth: "640px", // Might be shared with layout used by Profile and Listings pages, depending if the latter is two columns on larger breakpoints

    display: "flex",
    flexDirection: "column",
    gap: "3rem",
});

// Move data fetching to a reusable function
async function getListingData(slug) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: listing } = await supabase
        .from('listings')
        .select(`
      *,
      profiles (
        first_name,
        avatar
      )
    `)
        .match({ slug })
        .single();

    return { user, listing };
}

export async function generateMetadata({ params }) {
    const { slug } = await params;

    const { user, listing } = await getListingData(slug);

    if (!listing) {
        return {
            title: 'Listing Not Found'
        };
    }

    const listingDisplayName = getListingDisplayName(listing, user);
    return {
        title: `${listingDisplayName}`,
    };
}

export default async function ListingPage({ params }) {
    const { slug } = await params;
    const { user, listing } = await getListingData(slug);

    if (!listing) {
        notFound();
    }

    return (
        <StyledMain>
            <ListingRead user={user} listing={listing} />
        </StyledMain>
    );
}
