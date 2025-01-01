"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { fetchListingsInView } from "@/app/actions";

import MapSearch from "@/components/MapSearch";
import MapRender from "@/components/MapRender";
import ListingRead from "@/components/ListingRead";
import GuestActions from "@/components/GuestActions";

import { facts } from "@/data/facts";

import { styled } from "@pigment-css/react";

const StyledMapPage = styled("div")({
  // background: "red",
  display: "flex",
  flexDirection: "row",
  gap: "2rem",
  width: "100%",
  height: "100vh",
});

const StyledMapRender = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flex: 1,
});

const StyledSidebar = styled("div")({
  // background: "blue",
  border: "1px solid grey",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  width: "20rem",
  height: "100%",
  overflow: "scroll",
});

// export default async function MapPage() {
export default function MapPageClient({ user }) {
  const mapRef = useRef(null);
  const [initialCoordinates, setInitialCoordinates] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  // Set mapController to set relationship between MapSearch and MapRender
  const [mapController, setMapController] = useState(); // https://docs.maptiler.com/react/maplibre-gl-js/geocoding-control/

  const [isLoading, setIsLoading] = useState(true);

  const [randomFact, setRandomFact] = useState(null);

  useEffect(() => {
    // Only generate a random fact if there is NO selected listing, not when one is opened
    if (!selectedListing) {
      setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
    }
  }, [selectedListing]);

  // Load listing from URL param on mount
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (listingSlug) {
      loadListingBySlug(listingSlug);
    } else {
      // Clear selected listing if no slug in URL
      setSelectedListing(null);
    }
  }, [searchParams]); // This will run when the URL changes

  // Add this new effect to handle initial location
  useEffect(() => {
    const listingSlug = searchParams.get("listing");
    if (!listingSlug) {
      // Only fetch IP location if there's no listing in URL
      // TODO: Use MapTiler's API and compare which returns faster
      // TODO: see if there is location data already set from local storage, and return that first if so
      // Perhaps do this on the homepage/first page loaded and then use that data for the map
      // And then store that data in local storage for future use in the same session/browser
      // Consider using that as the default view state for the map for next time (by saving it to Supabase)
      async function initializeLocation() {
        console.log("No listing slug. Initializing location");
        try {
          const response = await fetch("https://freeipapi.com/api/json/", {
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok) throw new Error("IP lookup failed");
          const data = await response.json();

          if (data.latitude && data.longitude) {
            setInitialCoordinates({
              latitude: data.latitude,
              longitude: data.longitude,
              zoom: 5,
            });
          }
        } catch (error) {
          console.warn("Could not determine location from IP");
        }
      }
      initializeLocation();
    }
  }, []); // Run once on mount

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
    setIsLoading(true);
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
    setIsLoading(false);
  }, []);

  const handleMarkerClick = async (listingId) => {
    // If the clicked marker is already selected, do nothing and return early
    if (selectedListing?.id === listingId) {
      return;
    }

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
    console.log("Selected listing", data);

    setSelectedListing(data);
    // Update URL without full page reload
    router.push(`/map?listing=${data.slug}`, { scroll: false });
  };

  const handleMapClick = () => {
    // Since we're stopping propagation on marker clicks,
    // this will only fire when clicking the actual map, not a marker on the map
    if (selectedListing) {
      handleCloseListing();
    }
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
      zoom: 10, // TODO later: start at very zoomed out, zoom in until listings appear in bounding box
    });
  }, []);

  const handleCloseListing = () => {
    console.log("Closing listing");
    setSelectedListing(null);
    // Remove listing param from URL
    router.push("/map", { scroll: false });
  };

  return (
    <StyledMapPage>
      {/* <h1>Map for {user ? user.email : "Guest"}</h1> */}
      <StyledMapRender>
        <MapRender
          mapRef={mapRef}
          listings={listings}
          selectedListing={selectedListing}
          initialCoordinates={initialCoordinates}
          onBoundsChange={handleBoundsChange}
          isLoading={isLoading}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onSearchPick={handleSearchPick}
          setMapController={setMapController}
        />
      </StyledMapRender>

      <StyledSidebar>
        {selectedListing ? (
          <>
            <ListingRead
              user={user}
              listing={selectedListing}
              setSelectedListing={handleCloseListing}
              modal={true}
            />
          </>
        ) : (
          <>
            <MapSearch
              onPick={handleSearchPick}
              mapController={mapController}
            />
            {user && randomFact && (
              // TODO
              // If user has sent >0 messages, show a fun composting fact
              // Otherwise show the fundamentals (1, 2, 3) of Peels
              <>
                <p>{randomFact.fact}</p>
                {randomFact.source && <p>Source: {randomFact.source}</p>}
              </>
            )}
            {!user && (
              <>
                <h2>Find a home for your food scraps, wherever you are</h2>
                <GuestActions />
              </>
            )}
          </>
        )}
      </StyledSidebar>
    </StyledMapPage>
  );
}
