// deleteListing/index.ts (Edge Function)
import { createClient } from "@/utils/supabase/server";

export default async function handler(req, res) {
    const supabaseAdmin = createClient();
    const { slug } = req.body; // Assuming slug is sent in the request body

    try {
        // Fetch the listing to get the avatar
        const { data: listing, error: fetchError } = await supabaseAdmin
            .from("listings")
            .select("avatar")
            .eq("slug", slug)
            .single();

        if (fetchError) {
            return res.status(400).json({
                success: false,
                message: "Failed to fetch listing",
            });
        }

        // Delete avatar if it exists
        if (listing?.avatar) {
            const { error: storageError } = await supabaseAdmin.storage
                .from("avatars")
                .remove([listing.avatar]);

            if (storageError) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to delete avatar",
                });
            }
        }

        // Delete the listing
        const { error: deleteError } = await supabaseAdmin
            .from("listings")
            .delete()
            .eq("slug", slug);

        if (deleteError) {
            return res.status(400).json({
                success: false,
                message: "Failed to delete listing",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Listing deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
