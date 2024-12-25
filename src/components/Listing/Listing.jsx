import Link from "next/link";

function Listing({ user, listing, setSelectedListing }) {
  return (
    <div>
      <h2>Person viewing is {user ? user.email : "a guest"}</h2>
      <button
        onClick={() => {
          setSelectedListing(null);
        }}
      >
        Close
      </button>
      <pre>{JSON.stringify(listing, null, 2)}</pre>

      {user ? (
        <button>Contact {listing.name}</button>
      ) : (
        // TODO: Dynamically change sign up page h1 to say "Sign up to contact hosts"
        <Link href="/sign-up?type=contact-host">Contact host</Link>
      )}
    </div>
  );
}

export default Listing;
