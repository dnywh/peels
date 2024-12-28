"use client";
import { useCallback, useMemo, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import SimpleMap from "@/components/SimpleMap";
import SimpleListing from "@/components/SimpleListing";

// Create memoized component outside of ListingsPageClient
const MemoizedSimpleMap = memo(SimpleMap);

function ListingsPageClient({ user, initialListings }) {
  console.log("ListingsPageClient rendered");
  const router = useRouter();
  const pathname = usePathname();

  // Memoize listings to prevent unnecessary re-renders
  const listings = useMemo(() => initialListings, [initialListings]);

  // Memoize current listing slug from pathname
  const currentListingSlug = useMemo(() => {
    const slug = pathname.split("/").pop();
    return slug === "listings" ? null : slug;
  }, [pathname]);

  // Memoize selected listing based on current slug
  const selectedListing = useMemo(
    () =>
      currentListingSlug
        ? listings.find((l) => l.slug === currentListingSlug)
        : null,
    [currentListingSlug, listings]
  );

  const handleListingSelect = useCallback(
    (listing) => {
      if (listing.slug !== currentListingSlug) {
        router.push(`/listings/${listing.slug}`);
      }
    },
    [currentListingSlug, router]
  );

  return (
    <>
      <ul>
        {initialListings.map((listing) => (
          <li key={listing.id} onClick={() => handleListingSelect(listing)}>
            Listing: {listing.name}, {listing.slug}
          </li>
        ))}
      </ul>

      <MemoizedSimpleMap />

      <div>
        {selectedListing && (
          <SimpleListing
            listing={selectedListing}
            user={user}
            handleListingSelect={handleListingSelect}
          />
        )}
      </div>

      <hr />

      <h2>Raw</h2>
      <pre>{JSON.stringify(initialListings, null, 2)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export default ListingsPageClient;
