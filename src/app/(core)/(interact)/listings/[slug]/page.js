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

    // "@media (min-width: 768px)": {
    //     maxWidth: "1024px",
    //     marginLeft: ""
    // },
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
