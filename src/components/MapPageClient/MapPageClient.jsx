"use client";
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import MapSearch from "@/components/MapSearch";
import MapRender from "@/components/MapRender";
import Listing from "@/components/Listing";
import GuestActions from "@/components/GuestActions";

// export default async function MapPage() {
export default function MapPageClient({ user, initialListingSlug }) {
  const router = useRouter();
  const pathname = usePathname();
  const mapRef = useRef(null);

  // Memoize Supabase client
  const supabase = useMemo(() => createClient(), []);

  // Memoize listings to prevent unnecessary re-renders
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  // Derive current slug from URL
  const currentSlug = useMemo(() => {
    const slug = pathname.split("/").pop();
    return slug === "map" ? null : slug;
  }, [pathname]);

  // Handle URL-based listing selection
  useEffect(() => {
    async function fetchListingBySlug(slug) {
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          *,
          profiles (
            first_name,
            avatar
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching listing by slug:", error);
        return;
      }

      setSelectedListing(data);
    }

    if (currentSlug) {
      fetchListingBySlug(currentSlug);
    } else {
      setSelectedListing(null);
    }
  }, [currentSlug, supabase]);

  const handleListingSelect = useCallback(
    (listing) => {
      if (!listing) {
        router.push("/map");
        setSelectedListing(null);
        return;
      }

      console.log("Selecting listing:", listing);
      if (listing.slug && listing.slug !== currentSlug) {
        setSelectedListing(listing); // Set the listing first
        router.push(`/map/${listing.slug}`);
      }
    },
    [router, currentSlug]
  );

  const handleBoundsChange = useCallback(async (bounds) => {
    const data = await fetchListingsInView(
      bounds._sw.lat,
      bounds._sw.lng,
      bounds._ne.lat,
      bounds._ne.lng
    );
    console.log("Fetched listings:", data); // Debug log to see what fields we're getting
    setListings((prev) => {
      // Only update if data has changed
      if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
      return data;
    });
  }, []);

  const handleMarkerClick = useCallback(
    async (listingId) => {
      console.log("Finding listing with ID:", listingId);

      const { data, error } = await supabase
        .from("listings")
        .select(
          `
        *,
        profiles (
          first_name,
          avatar
        )
      `
        )
        .eq("id", listingId)
        .single();

      if (error) {
        console.error("Error fetching listing details:", error);
        return;
      }

      console.log("Found full listing details:", data);
      if (data?.slug) {
        handleListingSelect(data);
      }
    },
    [supabase, handleListingSelect]
  );

  const handleSearchPick = useCallback((event) => {
    // Quirk in MapTiler's Geocoding component: they consider tapping close an 'onPick
    // Return early if that's the case
    if (!event.feature?.center) return;

    console.log("Search picked", event);
    // Blur the input
    // inputRef.current.blur();

    // Return those new coordinates
    const nextCoordinates = {
      latitude: event.feature?.center[1],
      longitude: event.feature?.center[0],
    };

    console.log("Flying to", nextCoordinates);
    mapRef.current?.flyTo({
      center: [nextCoordinates.longitude, nextCoordinates.latitude],
      duration: 2800,
      zoom: 5, // TODO later: start at very zoomed out, zoom in until listings appear in bounding box
    });
  }, []);

  const handleMapClick = (event) => {
    console.log("Map clicked", event);
  };

  return (
    <div>
      <div>
        <h1>Map for {user ? user.email : "Guest"}</h1>
        <div>
          <MapSearch onPick={handleSearchPick} />

          <MapRender
            mapRef={mapRef}
            listings={listings}
            selectedListing={selectedListing}
            onBoundsChange={handleBoundsChange}
            // onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onSearchPick={handleSearchPick}
          />
        </div>
        <div>
          {selectedListing ? (
            <Listing
              user={user}
              listing={selectedListing}
              setSelectedListing={handleListingSelect}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
    </div>
  );
}
