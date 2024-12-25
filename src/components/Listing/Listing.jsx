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
        <Link href="/sign-up">Contact host</Link>
      )}
    </div>
  );
}

export default Listing;
