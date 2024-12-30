"use client";
import Link from "next/link";

export default function ProfileListings({ listings }) {
  if (!listings) return null;

  return (
    <div>
      <h2>Listings</h2>
      <ul>
        {listings.map(({ id, slug, type, name }) => (
          <li key={id}>
            <Link href={`/profile/listings/${slug}`}>
              <p>{type === "residential" ? name : name}</p>
              <p>{type}</p>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/add-listing">
            <p>Add another listing to the map</p>
            <small>
              Whether you're an individual, community, or business, we're always
              looking for new hosts.
            </small>
          </Link>
        </li>
      </ul>
    </div>
  );
}
