import { createClient } from "@/utils/supabase/server";
import MapPageClient from "@/components/MapPageClient";

export default async function Page({ params }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Just pass the slug if it exists
    // const initialSlug = params.listingSlug?.[0] || null;
    const initialListingSlug = (await params)?.listingSlug?.[0] ?? undefined;
    // const initialListingSlug = params.listingSlug?.[0] || null;

    return <MapPageClient user={user} initialListingSlug={initialListingSlug} />;
}
