import { createClient } from "@/utils/supabase/server";
import ListingFormClient from "./ListingFormClient";

export default async function ListingForm({ slug }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select()
    .eq("owner_id", user.id)
    .match({ slug })
    .single();

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return <ListingFormClient initialListing={listing} />;
}
