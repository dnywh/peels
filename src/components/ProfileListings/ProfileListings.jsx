"use client";
import Link from "next/link";

export default function ProfileListings({ firstName, listings }) {
  if (!listings) return null;

  return (
    <div>
      <ul>
        {listings.map(({ id, slug, type, name, visibility }) => (
          <li key={id}>
            <Link href={`/profile/listings/${slug}`}>
              <p>{type === "residential" ? firstName : name}</p>
              <small>
                {type.charAt(0).toUpperCase() + type.slice(1)} listing
              </small>
              {!visibility && <small>hidden</small>}
            </Link>
          </li>
        ))}
        {/* Only show the "add a/another listing" link if there are less than 3 listings */}
        {listings.length < 3 && (
          <li>
            <Link href="/profile/listings/new">
              {listings.length === 0 ? (
                <>
                  <p>Add a listing</p>
                  <small>
                    Put yourself, your community spot, or your business on the
                    map!
                  </small>
                </>
              ) : (
                <p>Add another listing</p>
              )}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
