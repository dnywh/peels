import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
    const { slug } = await req.json();

    try {
        // Fetch the listing to get the avatar
        const { data: listing, error: fetchError } = await supabaseAdmin
            .from("listings")
            .select("avatar")
            .eq("slug", slug)
            .single();

        if (fetchError) {
            console.error("Listing fetch error:", fetchError);
            throw fetchError;
        }

        // Delete avatar if it exists
        if (listing?.avatar) {
            const { error: storageError } = await supabaseAdmin.storage
                .from("listing_avatars")
                .remove([listing.avatar]);

            if (storageError) {
                console.error("Avatar deletion error:", storageError);
                throw storageError;
            }
        }

        // Delete the listing
        const { error: deleteError } = await supabaseAdmin
            .from("listings")
            .delete()
            .eq("slug", slug);

        if (deleteError) {
            console.error("Delete listing error:", deleteError);
            throw deleteError;
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Final error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
});
