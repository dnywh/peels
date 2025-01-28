"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

import MapPin from "@/components/MapPin";
import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

const FEATURED_LISTINGS = ["o2TTKU3vmBP9", "NPISVZDjJYsl", "HOaEy5gxgrvc"];

const MapPinContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",

  alignItems: "center",
  justifyContent: "center",
}));

const MapPinDemo = styled(MapPin)(({ theme }) => ({
  // position: "absolute",
  // top: "0",
  // left: "0",
}));

const MarkerDemo = styled("div")(({ theme }) => ({
  position: "relative", // Needed for the child map pin to be positioned correctly
}));

export default function PeelsMapDemo() {
  const supabase = createClient();
  const [selectedListing, setSelectedListing] = useState(null);

  const handleMapPinClick = (slug) => {
    loadListingBySlug(slug);
  };

  //
  const loadListingBySlug = async (slug) => {
    console.log("Loading listing by slug", slug);
    const { data, error } = await supabase
      .from("listings_with_owner_data")
      .select()
      .eq("slug", slug)
      .single();

    if (error) {
      setSelectedListing({ error: true, message: "Listing not found" });
      return;
    }
    console.log({ data });
    setSelectedListing(data);
  };

  // Load listing by slug on mount
  useEffect(() => {
    loadListingBySlug(FEATURED_LISTINGS[0]);
  }, []);

  return (
    <>
      <MapPinContainer>
        {FEATURED_LISTINGS.map((slug, index) => (
          <MarkerDemo
            key={slug}
            onClick={() => loadListingBySlug(FEATURED_LISTINGS[index])}
          >
            <MapPinDemo
              selected={selectedListing?.slug === slug}
              type={selectedListing?.type}
            />
          </MarkerDemo>
        ))}
      </MapPinContainer>

      <p>Selected listing: {selectedListing?.name}</p>
      <ListingRead
        selectedListing={selectedListing}
        setSelectedListing={setSelectedListing}
        presentation="demo"
      />
      {/* <ListingRead
        user={user}
        listing={selectedListing}
        setSelectedListing={handleCloseListing}
        isDrawer={true}
        isDesktop={isDesktop}
        isChatDrawerOpen={isChatDrawerOpen}
        setIsChatDrawerOpen={setIsChatDrawerOpen}
        pagePadding={pagePadding}
        sidebarWidth={sidebarWidth}
      /> */}
    </>
  );
}
