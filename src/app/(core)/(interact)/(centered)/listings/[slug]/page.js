import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'
import { siteConfig } from "@/config/site";
import { countries } from "@/data/countries";
import { getListingDisplayName } from "@/utils/listing";
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

    if (!listing) {
        return {
            title: 'Listing Not Found'
        };
    }

    const listingDisplayName = getListingDisplayName(listing, user);
    const listingCountryName = countries.find(country => country.code === listing.country_code)?.name;
    const listingFullLocation = `${listing.area_name}, ${listingCountryName}`
    const listingDescription = `${listingDisplayName} is ${listing.type === "residential" ? '' : ` a ${listing.type}`} based in ${listingFullLocation}. Connect with them on ${siteConfig.name}, ${siteConfig.meta.explainer}.`

    return {
        title: listingDisplayName, // Will be followed by title.template as defined in layout metadata (i.e. ` · Peels`)
        description: listingDescription,
        keywords: [
            listingFullLocation,
            `food scraps in ${listing.area_name} ${listingCountryName}`, // Not using ${listingFullLocation} as it has a comma, thus creating a new item in the array
            `compost ${listing.area_name}  ${listingCountryName}`,
            `food scrap drop-off ${listing.area_name}  ${listingCountryName}`,
            `compost drop-off ${listing.area_name}  ${listingCountryName}`,
            ...siteConfig.meta.keywords,
        ],
        openGraph: {
            title: listingDisplayName, // not appending 'Peels' since that comes through on siteName
            description: listingDescription,
            siteName: siteConfig.name,
            // TODO: The `opengraph-image` does not get passed down automatically, presumedly because this counts as a separate route segment
        },
    };
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
