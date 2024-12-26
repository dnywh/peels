"use client";
import { useState } from "react";

import Link from "next/link";

import StorageImage from "@/components/StorageImage";
import Chat from "@/components/Chat";

function Listing({ user, listing, setSelectedListing }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
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

      <div key={listing.id}>
        {listing.avatar && (
          <StorageImage
            bucket="listing_avatars"
            filename={listing.avatar}
            alt={listing.profiles.first_name}
            style={{ width: "100px", height: "100px" }}
          />
        )}
        {listing.profiles.avatar && (
          <StorageImage
            bucket="avatars"
            filename={listing.profiles.avatar}
            alt={listing.profiles.first_name}
            style={{ width: "100px", height: "100px" }}
          />
        )}

        <h2>
          {listing.type === "residential"
            ? listing.profiles.first_name
            : listing.name}
        </h2>
        <p>{listing.type}</p>
        <p>Last active: TODO</p>

        <div>
          <p>
            {user && listing.owner_id === user.id
              ? "This is your own listing, show button to edit instead of chat"
              : "Not your listing, show button to chat"}
          </p>

          {user ? (
            <button onClick={() => setIsChatOpen(true)}>
              Contact{" "}
              {listing.type === "residential"
                ? listing.profiles.first_name
                : listing.name}
            </button>
          ) : (
            // TODO: Dynamically change sign up page h1 to say "Sign up to contact hosts"
            <Link href="/sign-up?type=contact-host">Contact host</Link>
          )}
        </div>

        {isChatOpen && (
          <Chat user={user} listing={listing} setIsChatOpen={setIsChatOpen} />
        )}

        {listing.description && (
          <>
            <h3>About</h3>
            <p>{listing.description}</p>
          </>
        )}

        {/* <h3>Location</h3> */}

        {listing.accepted_items.length > 0 && (
          <>
            <h3>Accepted</h3>
            <ul>
              {listing.accepted_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {listing.rejected_items.length > 0 && (
          <>
            <h3>Not accepted</h3>
            <ul>
              {listing.rejected_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {listing.photos.length > 0 && (
          <>
            <h3>Photos</h3>
            <ul>
              {listing.photos.map((photo, index) => (
                <li key={index}>
                  <StorageImage
                    bucket="listing_photos"
                    filename={photo}
                    alt={`Photo ${index + 1}`}
                    style={{ width: "100px", height: "100px" }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {listing.links.length > 0 && (
          <>
            <h3>Links</h3>
            <ul>
              {listing.links.map((link, index) => (
                <li key={index}>
                  <Link href={link} target="_blank">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <h3>Raw data</h3>
        <pre>{JSON.stringify(listing, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Listing;
