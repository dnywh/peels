import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deleteListingMedia } from "../_shared/storage-utils.ts";

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
        // Delete all media first
        await deleteListingMedia(supabaseAdmin, slug);

        // Delete the listing
        const { error: deleteError } = await supabaseAdmin
            // We can access the "listings" table directly here as we're doing an operation through supabaseAdmin
            .from("listings")
            .delete()
            .eq("slug", slug);

        if (deleteError) throw deleteError;

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
