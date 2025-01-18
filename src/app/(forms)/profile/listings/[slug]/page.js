import { createClient } from "@/utils/supabase/server";

import FormHeader from "@/components/FormHeader";
import ListingWrite from "@/components/ListingWrite";

// Next.js automatically provides params
export default async function EditListingPage({ params }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

    const { data: listing } = await supabase
        .from("listings")
        .select()
        .eq("owner_id", user.id)
        .match({ slug })
        .single();

    if (!listing) {
        return <div>Listing not found</div>;
    }

    return (
        <>
            <FormHeader button="back">
                {/* <h1>{listing.type === "residential" ? profile.first_name : listing.name}</h1> */}
                <h1>Edit listing</h1>
            </FormHeader>

            <ListingWrite
                initialListing={listing}
                user={user}
                profile={profile}
            />
        </>
    );
} 
