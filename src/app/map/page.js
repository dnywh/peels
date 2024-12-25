"use client";
import GuestActions from "@/components/guest-actions";
import MapRender from "@/components/MapRender";
import { useState, useCallback } from "react";
import { fetchListingsInView } from "@/app/actions";

export default function MapPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  const handleBoundsChange = useCallback(async (bounds) => {
    console.log('Bounds changed. Bounds being sent:', bounds, {
      south: bounds._sw.lat,
      west: bounds._sw.lng,
      north: bounds._ne.lat,
      east: bounds._ne.lng
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
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles (
          first_name,
          avatar
        )
      `)
      .eq('id', listingId)
      .single();

    if (error) {
      console.error('Error fetching listing details:', error);
      return;
    }

    setSelectedListing(data);
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1>Map</h1>
        <div className="flex">
          <MapRender
            listings={listings}
            onBoundsChange={handleBoundsChange}
            onMarkerClick={handleMarkerClick}
          />
          {selectedListing && (
            <div className="w-1/3">
              <pre>{JSON.stringify(selectedListing, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
