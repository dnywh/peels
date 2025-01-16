import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deleteListingMedia } from "../_shared/storage-utils.ts";
serve(async (req)=>{
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { user_id } = await req.json();
  try {
    // Get the user's profile to find avatar
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("avatar").eq("id", user_id).single();
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }
    // Delete avatar if it exists
    if (profile?.avatar) {
      const { error: storageError } = await supabaseAdmin.storage.from("avatars").remove([
        profile.avatar
      ]);
      if (storageError) {
        console.error("Avatar deletion error:", storageError);
        throw storageError;
      }
      console.log("Deleted avatar:", profile.avatar);
    }
    // Fetch all listings for the user to delete their avatars
    const { data: listings, error: listingsError } = await supabaseAdmin.from("listings").select("slug").eq("owner_id", user_id);
    if (listingsError) {
      console.error("Listings fetch error:", listingsError);
      throw listingsError;
    }
    // Delete media for each listing
    for (const listing of listings){
      try {
        await deleteListingMedia(supabaseAdmin, listing.slug);
      } catch (error) {
        console.error(`Error deleting media for listing ${listing.slug}:`, error);
        throw error;
      }
    }
    // Delete auth user (cascade will handle the rest)
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (deleteUserError) {
      console.error("Auth user deletion error:", deleteUserError);
      throw deleteUserError;
    }
    console.log("Deleted auth user");
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Final error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
