import { createClient } from "@/utils/supabase/server";

import FormHeader from "@/components/FormHeader";
import ListingWrite from "@/components/ListingWrite";

export const metadata = {
    title: 'Edit Listing',
}
// TODO: Generate the actual title from the listing data and append to the title
// E.g. "Edit Listing | Pullman | Peels"
// Probably involves generateMetadata, e.g:

// export async function generateMetadata({ params }) {
//     const { slug } = await params;

//     const { user, listing } = await getListingData(slug);

//     if (!listing) {
//         return {
//             title: 'Listing Not Found'
//         };
//     }

//     const listingDisplayName = getListingDisplayName(listing, user);
//     return {
//         title: `${listingDisplayName}`,
//     };
// }

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
        .from("listings_with_owner_data")
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
