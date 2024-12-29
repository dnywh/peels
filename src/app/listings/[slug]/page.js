import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'

import Listing from "@/components/Listing";

export default async function Post({ params }) {
    const supabase = await createClient();
    // Get current user's info
    const { data: { user } } = await supabase.auth.getUser();
    // console.log(user);

    // Generate pages
    const { slug } = await params;  // Awaiting params to access slug

    const { data } = await supabase
        .from('listings')
        .select(
            `
            *,
            profiles (
              first_name,
              avatar
            )
          `
        )
        .match({ slug })  // Use slug to match the listing
        .single()

    if (!data) {
        notFound()
    }

    return (
        <>
            <Listing user={user} listing={data} />
        </>
    )
}
