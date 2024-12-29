import { createClient } from "@/utils/supabase/server";
import ProfileListings from "../ProfileListings";

export default async function ProfileData() {
  const supabase = await createClient();

  // Get user data and listings in one query
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: listings } = await supabase
    .from("listings")
    .select()
    .eq("owner_id", user.id);

  console.log("Profile data:", { user, listings });

  // Pass the data down to client components
  return (
    <>
      <ProfileListings listings={listings} />
    </>
  );
}
