import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*');

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, avatar');

  // Combine the data
  const listingsWithProfiles = listings?.map(listing => ({
    ...listing,
    creator: profiles?.find(profile => profile.id === listing.user_id)
  }));

  console.log('Combined listings:', listingsWithProfiles);

  // const { data: listings, error } = await supabase
  //   .from("listings")
  //   .select(`
  //     *)
  //   `)
  // console.log(listings);
  // console.log(error);

  // const { data: profiles, error: profilesError } = await supabase
  //   .from("profiles")
  //   .select('*')
  // console.log(profiles);
  // console.log(profilesError);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        {user ? (
          <div>
            <h2>Map interface for logged in users</h2>
            {/* <ul>
              {listings.map((listing) => (
                <li key={listing.id}>{listing.name}</li>
              ))}
            </ul> */}
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
