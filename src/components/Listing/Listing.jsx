"use client";
import { useState, memo } from "react";

import Link from "next/link";

import StorageImage from "@/components/StorageImage";
import ChatWindow from "@/components/ChatWindow";

// Memoize the Listing component
const Listing = memo(function Listing({
  user,
  listing,
  setSelectedListing,
  modal,
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // TODO: is this secure? Should this be done on the server or database?
  let listingName =
    listing.type === "residential" ? listing.profiles.first_name : listing.name;
  if (!user && listing.type === "residential") {
    listingName = "Private Host";
  }

  return (
    <div>
      <button onClick={setSelectedListing}>Close</button>

      <div key={listing.id}>
        {listing.type === "residential" ? (
          <StorageImage
            bucket="avatars"
            filename={listing.profiles.avatar}
            alt={listing.profiles.first_name}
            style={{ width: "100px", height: "100px" }}
          />
        ) : (
          <StorageImage
            bucket="listing_avatars"
            filename={listing.avatar}
            alt={listing.name}
            style={{ width: "100px", height: "100px" }}
          />
        )}

        <h2>{listingName}</h2>
        <p>{listing.type}</p>
        {/* <p>Last active: TODO</p> */}

        <p>Permalink: {listing.slug}</p>

        <div>
          <p>
            {user && listing.owner_id === user.id
              ? "This is your own listing, show button to edit instead of chat"
              : "Not your listing, show button to chat"}
          </p>

          {user ? (
            listing.owner_id === user.id ? (
              <Link href="/edit-listing">Edit listing</Link>
            ) : (
              <button onClick={() => setIsChatOpen(true)}>
                Contact{" "}
                {listing.type === "residential"
                  ? listing.profiles.first_name
                  : listing.name}
              </button>
            )
          ) : (
            <Link href="/sign-up?type=contact-host">Contact host</Link>
          )}
        </div>

        {isChatOpen && (
          <ChatWindow
            user={user}
            listing={listing}
            setIsChatOpen={setIsChatOpen}
          />
        )}

        {listing.description && (
          <>
            <h3>About</h3>
            <p>{listing.description}</p>
          </>
        )}

        {!modal && (
          <>
            <h3>Location</h3>
            <p>{listing.location}</p>
            {listing.type === "residential" && (
              <p>Contact host for the exact location.</p>
            )}
            <Link href={`/map?listing=${listing.slug}`}>View on map</Link>
          </>
        )}

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
        <Link href={`/listings/${listing.slug}`}>Permalink</Link>
        <h3>Raw data</h3>
        <pre>{JSON.stringify(listing, null, 2)}</pre>
      </div>
    </div>
  );
});

export default Listing;
