import { createClient } from "@/utils/supabase/server";

import Link from "next/link";

import ListingWrite from "@/components/ListingWrite";

// Next.js automatically provides params
export default async function EditListingPage({ params }) {
    const { slug } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: listing } = await supabase
        .from("listings")
        .select()
        .eq("owner_id", user.id)
        .match({ slug })
        .single();

    if (!listing) {
        return <div>Listing not found</div>;
    }

    console.log("listing", listing);

    return (
        <div>
            <h1>Edit Listing</h1>
            <ListingWrite initialListing={listing} />
            <hr />
            {/* TODO: warn if unsaved changes? */}
            <Link href={`/listings/${slug}`}>View listing</Link>
        </div>
    );
} 
