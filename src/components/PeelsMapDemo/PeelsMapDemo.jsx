"use client";
import { useState, useEffect } from "react";
import { demoListings } from "@/data/demo/listings";
import PeelsLogo from "@/components/PeelsLogo";
import MapPin from "@/components/MapPin";
import ListingRead from "@/components/ListingRead";
import { styled } from "@pigment-css/react";

const INTERVAL_DURATION = 7000;

const Wrapper = styled("div")(({ theme }) => ({
  width: "100vw",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  // https://css-tricks.com/almanac/properties/m/mask-image/
  maskImage: "linear-gradient(black 80%, transparent 95%)",

  "@media (min-width: 960px)": {
    // marginLeft: "-5rem", // Optical offset
    // marginTop: "1.5rem",
    flexDirection: "row",
  },
}));

const Left = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",

  width: "100%",

  "@media (min-width: 960px)": {
    gap: "1rem",
    maxWidth: theme.spacing.container.maxWidth.text,
    height: "512px",
    // marginLeft: "5rem", // Match margins on ListingDemo
  },
}));

const MapContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderRadius: "1rem",
  height: "320px",
  "@media (min-width: 960px)": {
    height: "100%",
  },

  // Pseudo-element needed to mask only background
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: "url('/map-tiles/demo.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    maskImage: "radial-gradient(black 0%, transparent 74%)",
    borderRadius: "inherit",
    zIndex: -1,
  },
}));

const MarkerDemo = styled("div")(({ theme }) => ({
  // First centre each marker
  position: "absolute",
  top: "50%",
  left: "50%",
  // Use the container's dimensions for offset calculation
  transform: `
    translate(
      calc(-50% + (var(--x-offset) * 1px)), 
      calc(-50% + (var(--y-offset) * 1px))
    )
  `,
}));

const Right = styled("div")(({ theme }) => ({
  marginTop: "-7rem",
  position: "relative",

  "@media (min-width: 960px)": {
    marginTop: "0",
    marginLeft: "-4rem", // Match map container margin
    // marginRight: "1rem", // For awkward viewport widths
  },
}));

const ListingBackground = styled("div")(({ theme }) => ({
  background: theme.colors.background.pit,
  border: `5px dashed ${theme.colors.border.light}`,
  borderRadius: `calc(${theme.corners.base} * 2)`,

  position: "absolute",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  transform: `scale(0.65) rotate(-1.5deg)`,
}));

const ListingDemo = styled("div")(({ theme }) => ({
  backgroundColor: theme.colors.background.top,
  height: "512px",
  overflow: "hidden",
  width: "95vw",
  maxWidth: "400px",
  transform: `scale(0.88) rotate(var(--rotation-angle))`,
  transition: "opacity 200ms ease-out, transform 200ms ease-out",

  padding: "2.5rem 1rem",
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: `${theme.corners.base}`,

  "@media (min-width: 960px)": {
    transform: `scale(0.95) rotate(var(--rotation-angle))`,
    height: "640px",
  },

  "&[data-transitioning='true']": {
    opacity: 0,
    transform: `scale(0.9) rotate(var(--rotation-angle))`,
    "@media (min-width: 960px)": {
      transform: `scale(0.8625) rotate(var(--rotation-angle))`,
    },
  },
}));

export default function PeelsMapDemo({ stepHeader }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const loadListingByIndex = async (index) => {
    setIsTransitioning(true);

    // Reset selected index to null to trigger fade out
    // setSelectedIndex(0);

    // Wait for fade out
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSelectedIndex(index);

    // Generate new rotation angle only after fade out, before fade in
    const newRotation = Math.random() * 4 - 2; // Random value between -2 and +2
    setRotationAngle(newRotation);

    // Reset transition state after a brief delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 50);
  };

  // Initial load effect - runs once
  useEffect(() => {
    // Start with a random index
    const randomIndex = Math.floor(Math.random() * demoListings.length);
    loadListingByIndex(randomIndex);
  }, []); // Empty dependency array for initial load only

  // Cycling effect - separate from initial load
  useEffect(() => {
    const interval = setInterval(() => {
      // Move to next index, loop back to 0 if we're at the end
      const nextIndex = (selectedIndex + 1) % demoListings.length;
      loadListingByIndex(nextIndex);
    }, INTERVAL_DURATION);

    return () => clearInterval(interval);
  }, [selectedIndex]); // Need selectedIndex to calculate next index

  return (
    <Wrapper>
      <Left>
        {stepHeader}
        <MapContainer>
          {demoListings.map((listing, index) => {
            // Convert percentage to pixels based on container dimensions
            const containerWidth = 512; // maxWidth of MapContainer
            const containerHeight = 200; // height of MapContainer
            const xPixels =
              (listing.map_position.x / 100) * (containerWidth / 2);
            const yPixels =
              (listing.map_position.y / 100) * (containerHeight / 2);

            return (
              <MarkerDemo
                key={index}
                onClick={() => loadListingByIndex(index)}
                style={{
                  "--x-offset": xPixels,
                  "--y-offset": yPixels,
                }}
              >
                <MapPin
                  selected={
                    isTransitioning === false && selectedIndex === index
                  }
                  type={listing.type}
                />
              </MarkerDemo>
            );
          })}
        </MapContainer>
      </Left>

      <Right>
        <ListingBackground>
          <PeelsLogo size={96} color="emptyState" />
        </ListingBackground>
        <ListingDemo
          data-transitioning={isTransitioning}
          style={{ "--rotation-angle": `${rotationAngle}deg` }}
        >
          <ListingRead
            listing={demoListings[selectedIndex]}
            presentation="demo"
            user={null}
          />
        </ListingDemo>
      </Right>
    </Wrapper>
  );
}
