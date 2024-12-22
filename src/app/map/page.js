import GuestActions from "@/components/guest-actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
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
    .eq('visibility', true)

  console.log(listings);
  console.log(error);

  function getListingAvatarUrl(filename) {
    const { data: { publicUrl } } = supabase.storage
      .from('listing_avatars')
      .getPublicUrl(filename)
    return publicUrl
  }

  function getUserAvatarUrl(filename) {
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)
    return publicUrl
  }

  function getPhotoUrl(filename) {
    const { data: { publicUrl } } = supabase.storage
      .from('listing_photos')
      .getPublicUrl(filename)
    return publicUrl
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        {user ? (
          <div>
            <h1>Map interface for logged in users</h1>
            <ul>
              {listings.map((listing) => (
                <li key={listing.id}>
                  {listing.avatar &&
                    <>
                      <img src={getListingAvatarUrl(listing.avatar)} alt={listing.profiles.first_name} style={{ width: '100px', height: '100px' }} />
                    </>
                  }
                  {listing.profiles.avatar &&
                    <>
                      <img src={getUserAvatarUrl(listing.profiles.avatar)} alt={listing.profiles.first_name} style={{ width: '100px', height: '100px' }} />
                    </>
                  }

                  <h2>{listing.type === 'residential' ? listing.profiles.first_name : listing.name}</h2>
                  <p>{listing.type}</p>
                  <p>Location: {listing.latitude}, {listing.longitude}</p>
                  <p>Last active: TODO</p>

                  <button>Contact {listing.type === 'residential' ? listing.profiles.first_name : listing.name}</button>

                  <h3>About</h3>
                  <p>{listing.description}</p>

                  <h3>Location</h3>
                  <p>{listing.location_legible}</p>

                  {listing.accepted_items.length > 0 &&
                    <>
                      <h3>Accepted</h3>
                      <ul>
                        {listing.accepted_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>
                  }

                  {listing.rejected_items.length > 0 &&
                    <>
                      <h3>Not accepted</h3>
                      <ul>
                        {listing.rejected_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </>}

                  {listing.photos.length > 0 &&
                    <>
                      <h3>Photos</h3>
                      <ul>
                        {listing.photos.map((photo, index) => (
                          <li key={index}><img src={getPhotoUrl(photo)} alt={`Photo ${index + 1}`} style={{ width: '100px', height: '100px' }} /></li>
                        ))}
                      </ul>
                    </>
                  }

                  {listing.links.length > 0 &&
                    <>
                      <h3>Links</h3>
                      <ul>
                        {listing.links.map((link, index) => (
                          <li key={index}><Link href={link} target="_blank">{link}</Link></li>
                        ))}
                      </ul>
                    </>
                  }
                  <p>End of listing</p>
                </li>
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
