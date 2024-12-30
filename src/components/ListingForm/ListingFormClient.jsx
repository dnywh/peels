"use client";
import { useState } from "react";

export default function ListingFormClient({ initialListing }) {
  const [listing, setListing] = useState(initialListing);

  // Form handling logic here
  return (
    <form>
      <input
        type="text"
        value={listing.name}
        onChange={(e) =>
          setListing((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
      />
      {/* More form fields */}
    </form>
  );
}
