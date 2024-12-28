import React from "react";

function SimpleListing({ listing, user, handleListingSelect }) {
  return (
    <div>
      <h2>Selected listing:</h2>
      <p>Name: {listing.name}</p>
      <p>Slug: {listing.slug}</p>
      {/* <button onClick={() => handleListingSelect("")}>Close</button> */}
    </div>
  );
}

export default SimpleListing;
