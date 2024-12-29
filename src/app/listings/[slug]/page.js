import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'

export default async function Post({ params }) {
    const supabase = await createClient();

    const { slug } = await params;  // Awaiting params to access slug

    const { data } = await supabase
        .from('listings')
        .select()
        .match({ slug })  // Use slug to match the listing
        .single()

    console.log("listing", data);

    if (!data) {
        notFound()
    }

    return <pre>{JSON.stringify(data, null, 2)}</pre>
}
