import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
    *,
    profiles (
      first_name,
      avatar
    )
  `)

  console.log(listings);
  // console.log(error);


  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        {user ? (
          <div>
            <h2>Map interface for logged in users</h2>
            <ul>
              {listings.map((listing) => (
                <li key={listing.id}>{listing.name} by {listing.profiles.first_name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h1>Discover People Near You</h1>
            <p>Sign in to connect with people in your area</p>

            <GuestActions />
          </div>
        )}
      </div>
    </div>
  );
}
