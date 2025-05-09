import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'
import { generateListingMetadata } from "@/utils/listingUtils";
import ListingRead from "@/components/ListingRead";
import { styled } from "@pigment-css/react";

const StyledMain = styled("main")({
    flex: 1, // Should be shared with layout used by Profile and Listings pages
    margin: "2rem auto",  // Should be shared with layout used by Profile and Listings pages
    maxWidth: "640px", // Might be shared with layout used by Profile and Listings pages, depending if the latter is two columns on larger breakpoints

    display: "flex",
    flexDirection: "column",
    gap: "3rem", // Match in MapPageClient (StyledDrawerInner)

    "@media (min-width: 768px)": {
        margin: "0 auto 2rem",
    },
    // Multiple columns on larger breakpoints
    "@media (min-width: 1280px)": {
        gap: "1.5rem", // Smaller gap between what are now columns
        maxWidth: "1024px",
        display: "grid",
        gridTemplateColumns: "7fr 5fr",
    },
    "@media (min-width: 1920px)": {
        maxWidth: "1344px",
        gridTemplateColumns: "8fr 4fr",
    },

});

async function getListingData(slug) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: listing } = await supabase
        .from(user ? 'listings_private_data' : 'listings_public_data')
        .select()
        .match({ slug })
        .single();
    return { user, listing };
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const { user, listing } = await getListingData(slug);
    // Use shared utility to generate metadata
    return generateListingMetadata(listing, user, { includeFullMetadata: true });
}

export default async function ListingPage({ params }) {
    const { slug } = await params;
    const { user, listing } = await getListingData(slug);

    if (!listing) {
        notFound();
    }

    // TODO: Return 'Success' toast for folks who have just created a new listing and have been redirected to it, here

    return (
        <StyledMain>
            <ListingRead
                user={user}
                listing={listing}
            />
        </StyledMain>
    );
}
