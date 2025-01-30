import { createClient } from "@/utils/supabase/server";
import MapPageClient from "@/components/MapPageClient";
import { getListingDisplayName } from "@/utils/listing";

// Add generateMetadata function
export async function generateMetadata({ searchParams }) {
    // Create Supabase client first
    const supabase = await createClient();

    // Get listing slug from URL if it exists
    const listingSlug = (await searchParams)?.listing;
    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    // If no listing slug, return default metadata
    if (!listingSlug) {
        return {
            title: "Map",
        };
    }

    // Fetch listing data from Supabase
    const { data: listing } = await supabase
        .from("listings_with_owner_data")
        .select()
        .eq("slug", listingSlug)
        .single();

    // If listing not found, return default metadata
    if (!listing) {
        return {
            title: "Listing Not Found",
        };
    }

    // Return dynamic metadata based on listing, passing in user
    return {
        title: `${getListingDisplayName(listing, user)}`,
    };
}

export default async function Page({ searchParams }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const initialListingSlug = (await searchParams)?.listing ?? undefined;

    return <MapPageClient user={user} initialListingSlug={initialListingSlug} />;
}
