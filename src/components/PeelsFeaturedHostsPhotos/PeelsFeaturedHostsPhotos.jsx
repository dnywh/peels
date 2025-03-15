"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import PhotoThumbnail from "@/components/PhotoThumbnail";
import { styled } from "@pigment-css/react";

const featuredListingsForPhotos = [
  "oLbJwGqRQrzo",
  "KX5eqmXGadu2",
  "fmpYQJpmXLLn",
  "4y9eRikD5Dku",
  "o2TTKU3vmBP9",
  "NPISVZDjJYsl",
  "HOaEy5gxgrvc",
  "itKrzEbLPDPf",
  "B030fsqGqMzt",
];

const MAX_PHOTOS_TO_SHOW = 3;

const PhotoRow = styled("ul")(({ theme }) => ({
  margin: "2rem 0",
  display: "flex",
  flexDirection: "row",
  gap: "0.75rem",
  justifyContent: "center",

  "& li": {
    transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    "&:first-of-type": {
      transform: "rotate(-2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(-2deg) translateY(0.5rem) scale(1.05)",
      },
    },
    "&:nth-of-type(2)": {
      transform: "scale(1)",
      "&:hover": {
        transform: "scale(1.05)",
      },
    },
    "&:last-of-type": {
      transform: "rotate(2deg) translateY(0.5rem) scale(1)",
      "&:hover": {
        transform: "rotate(2deg) translateY(0.5rem) scale(1.05)",
      },
    },
  },

  "@media (min-width: 768px)": {
    gap: "2rem",
  },
}));

function PeelsFeaturedHostsPhotos() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    const loadListings = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select()
        .in("slug", featuredListingsForPhotos)
        .neq("type", "residential")
        .neq("visibility", false)
        .neq("photos", "{}")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error loading featured listings:", error);
        return;
      }
      // Randomize the array before setting state
      const shuffledData = [...data].sort(() => Math.random() - 0.5);
      setFeaturedListings(shuffledData);
    };

    loadListings();
  }, []);

  return (
    <PhotoRow>
      {featuredListings.slice(0, MAX_PHOTOS_TO_SHOW).map((listing) => (
        <PhotoThumbnail
          key={listing.slug}
          fileName={listing.photos[0]}
          listingId={listing.slug}
          caption={listing.name}
        />
      ))}
    </PhotoRow>
  );
}

export default PeelsFeaturedHostsPhotos;
