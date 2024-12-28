"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import MapSearch from "@/components/MapSearch";
import MapRender from "@/components/MapRender";
import Listing from "@/components/Listing";
import GuestActions from "@/components/GuestActions";

// export default async function MapPage() {
export default function MapPageClient({ user }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  // Set mapController to set relationship between MapSearch and MapRender
  const [mapController, setMapController] = useState(); // https://docs.maptiler.com/react/maplibre-gl-js/geocoding-control/

  const mapRef = useRef(null);

  // Load listing from URL param on mount
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (listingSlug && !selectedListing) {
      loadListingBySlug(listingSlug);
    }
  }, [searchParams]);

  const loadListingBySlug = async (slug) => {
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
      console.error("Error fetching listing details:", error);
      return;
    }

    setSelectedListing(data);
  };

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
    // Update URL without full page reload
    router.push(`/map?listing=${data.slug}`, { scroll: false });
  };

  const handleMapClick = (event) => {
    console.log("Map clicked", event);
  };

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

  const handleCloseListing = () => {
    setSelectedListing(null);
    // Remove listing param from URL
    router.push("/map", { scroll: false });
  };

  return (
    <div>
      <div>
        <h1>Map for {user ? user.email : "Guest"}</h1>
        <div>
          <MapSearch onPick={handleSearchPick} mapController={mapController} />

          <MapRender
            mapRef={mapRef}
            listings={listings}
            selectedListing={selectedListing}
            onBoundsChange={handleBoundsChange}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onSearchPick={handleSearchPick}
            setMapController={setMapController}
          />
        </div>
        <div>
          {selectedListing ? (
            <Listing
              user={user}
              listing={selectedListing}
              setSelectedListing={handleCloseListing}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
    </div>
  );
}
