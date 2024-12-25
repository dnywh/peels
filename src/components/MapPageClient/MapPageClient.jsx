"use client";
import { useState, useCallback } from "react";

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import MapRender from "@/components/MapRender";
import Listing from "@/components/Listing";
import GuestActions from "@/components/guest-actions";

// export default async function MapPage() {
export default function MapPageClient({ user }) {
  const supabase = createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // console.log("User", user);
  // console.log("User", user);

  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  const handleBoundsChange = useCallback(async (bounds) => {
    console.log("Bounds changed. Bounds being sent:", bounds, {
      bottomLeftWest: bounds._sw.lat,
      bottomLeftSouth: bounds._sw.lng,
      topRightNorth: bounds._ne.lat,
      topRightEast: bounds._ne.lng,
    });

    const data = await fetchListingsInView(
      bounds._sw.lat,
      bounds._sw.lng,
      bounds._ne.lat,
      bounds._ne.lng
    );
    console.log("Data fetched:", data);
    setListings(data);
  }, []);

  const handleMarkerClick = async (listingId) => {
    console.log("Marker clicked");
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

    setSelectedListing(data);
  };

  const handleMapClick = (event) => {
    console.log("Map clicked", event);
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1>Map for {user ? user.email : "Guest"}</h1>
        <div className="flex">
          <MapRender
            listings={listings}
            onBoundsChange={handleBoundsChange}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </div>
        <div>
          {selectedListing ? (
            <Listing
              user={user}
              listing={selectedListing}
              setSelectedListing={setSelectedListing}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
    </div>
  );
}
