import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getBearerToken } from "../_shared/auth.ts";
import { deleteListingMedia } from "../_shared/storage-utils.ts";

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const accessToken = getBearerToken(req.headers.get("Authorization"));

    if (!accessToken) {
      return jsonResponse({ error: "Missing access token" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("delete-account is missing required Supabase env vars");
      return jsonResponse({ error: "Function misconfigured" }, 500);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse({ error: "Invalid access token" }, 401);
    }

    // Get the user's profile to find avatar
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("avatar")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }
    // Delete avatar if it exists
    if (profile?.avatar) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("avatars")
        .remove([profile.avatar]);
      if (storageError) {
        console.error("Avatar deletion error:", storageError);
        throw storageError;
      }
      console.log("Deleted avatar:", profile.avatar);
    }
    // Fetch all listings for the user to delete their avatars
    const { data: listings, error: listingsError } = await supabaseAdmin
      .from("listings")
      .select("slug")
      .eq("owner_id", user.id);
    if (listingsError) {
      console.error("Listings fetch error:", listingsError);
      throw listingsError;
    }
    // Delete media for each listing
    for (const listing of listings ?? []) {
      if (!listing.slug) {
        console.warn("Skipping listing media deletion because slug is missing");
        continue;
      }

      try {
        await deleteListingMedia(supabaseAdmin, listing.slug);
      } catch (error) {
        console.error(
          `Error deleting media for listing ${listing.slug}:`,
          error
        );
        throw error;
      }
    }
    // Delete auth user (cascade will handle the rest)
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      console.error("Auth user deletion error:", deleteUserError);
      throw deleteUserError;
    }
    console.log("Deleted auth user");
    return jsonResponse({ success: true }, 200);
  } catch (error) {
    console.error("Final error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
