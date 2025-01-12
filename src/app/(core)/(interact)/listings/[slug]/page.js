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
    maxWidth: "960px", // Should be shared with ProfileLayoutClient

    // "@media (min-width: 768px)": {
    //     maxWidth: "1024px",
    //     marginLeft: ""
    // },

    // Optically center the content once the screen width is greater than tab bar + gutter + content width
    // Calculate this dynamically rather than guessing the tab bar width (and gutters, etc) as 2rem
    "@media (min-width: 1200px)": {
        transform: "translateX(-2rem)", // Should be more exactly calculated from TabBar width (and account for gutters, etc) and also shared with Listings page
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
