import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'

import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

import { getListingDisplayName } from "@/utils/listing";

const StyledMain = styled("main")({
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
    margin: "4rem auto",
    maxWidth: "640px",

    "& > section": {
        // backgroundColor: "red",
    },

    "@media (min-width: 768px)": {
        "& > *": {
            marginLeft: "-4.25rem", // TODO: Set tab bar as floating on this page instead, or (failing that) make this offset dynamic based on desktop tab bar width
        },
    },
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
    const { user, listing } = await getListingData(params.slug);

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
    const { user, listing } = await getListingData(params.slug);

    if (!listing) {
        notFound();
    }

    return (
        <StyledMain>
            <ListingRead user={user} listing={listing} />
        </StyledMain>
    );
}
