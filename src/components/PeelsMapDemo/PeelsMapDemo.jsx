"use client";

import { useState, useEffect } from "react";

import { exampleListings } from "@/data/example-listings";

import MapPin from "@/components/MapPin";
import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

const MapPinContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",

  alignItems: "center",
  justifyContent: "center",
}));

const MarkerDemo = styled("div")(({ theme }) => ({
  position: "relative", // Needed for the child map pin to be positioned correctly
}));

const MapPinDemo = styled(MapPin)(({ theme }) => ({
  // position: "absolute",
  // top: "0",
  // left: "0",
}));

export default function PeelsMapDemo() {
  const [selectedListing, setSelectedListing] = useState(null);

  const loadListingBySlug = async (slug) => {
    const listing = exampleListings.find((listing) => listing.slug === slug);
    setSelectedListing(listing);
  };

  // Load listing by slug on mount
  useEffect(() => {
    loadListingBySlug(exampleListings[0].slug);
  }, []);

  return (
    <>
      <MapPinContainer>
        {exampleListings.map((listing, index) => (
          <MarkerDemo
            key={listing.slug}
            onClick={() => loadListingBySlug(listing.slug)}
          >
            <MapPinDemo
              selected={selectedListing?.slug === listing.slug}
              type={listing.type}
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
    </>
  );
}
