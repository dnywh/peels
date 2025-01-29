"use client";

import { useState, useEffect } from "react";

import { demoListings } from "@/data/demo/listings";

import MapPin from "@/components/MapPin";
import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

const Container = styled("div")(({ theme }) => ({
  width: "100vw",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  // https://css-tricks.com/almanac/properties/m/mask-image/
  maskImage: "linear-gradient(black 80%, transparent 95%)",

  "@media (min-width: 768px)": {
    marginTop: "1.5rem",
    flexDirection: "row",
    // maskImage: "none",
  },
}));

const MapContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",

  alignItems: "center",
  justifyContent: "center",

  position: "relative",
  width: "100%",
  maxWidth: "640px",
  height: "320px",
  borderRadius: "1rem",
  backgroundImage: "url('/map-tiles/demo.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  maskImage: "radial-gradient(black 0%, transparent 74%)",

  "@media (min-width: 768px)": {
    maxWidth: "640px",
    height: "512px",
    marginLeft: "6rem", // Match margins on ListingDemo
  },
  // Add debug crosshair at center
  // "&::after": {
  //   content: '""',
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  //   width: "20px",
  //   height: "20px",
  //   transform: "translate(-50%, -50%)",
  //   border: "1px solid red",
  //   borderRadius: "50%",
  // },
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

const ListingDemo = styled("div")(({ theme }) => ({
  marginTop: "-7rem",

  backgroundColor: theme.colors.background.top,
  height: "50vh",
  overflow: "hidden",
  width: "95vw",
  maxWidth: "400px",
  transform: `scale(0.88) rotate(var(--rotation-angle))`,
  transition: "opacity 200ms ease-out, transform 200ms ease-out",

  padding: "2.5rem 1rem",
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: `${theme.corners.base}`,

  "@media (min-width: 768px)": {
    marginTop: "0",
    marginLeft: "-4rem", // Match map container margin
    marginRight: "2rem",
    transform: `scale(0.95) rotate(var(--rotation-angle))`,
    height: "640px",
  },

  "&[data-transitioning='true']": {
    opacity: 0,
    transform: `scale(0.9) rotate(var(--rotation-angle))`,
    "@media (min-width: 768px)": {
      transform: `scale(0.8625) rotate(var(--rotation-angle))`,
    },
  },
}));

export default function PeelsMapDemo() {
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
      console.log("Cycling to listing index:", nextIndex);
      loadListingByIndex(nextIndex);
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedIndex]); // Need selectedIndex to calculate next index

  const getGaussianRandom = () => {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    // Scale to roughly -30 to +30 with most points clustered near center
    return z * 15;
  };

  return (
    <Container>
      <MapContainer>
        {demoListings.map((listing, index) => {
          // Convert percentage to pixels based on container dimensions
          const containerWidth = 512; // maxWidth of MapContainer
          const containerHeight = 200; // height of MapContainer
          const xPixels = (listing.map_position.x / 100) * (containerWidth / 2);
          const yPixels =
            (listing.map_position.y / 100) * (containerHeight / 2);

          // console.log(`Marker ${index} pixels:`, {
          //   x: xPixels,
          //   y: yPixels,
          //   name: listing.name,
          // });

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
                selected={isTransitioning === false && selectedIndex === index}
                type={listing.type}
              />
            </MarkerDemo>
          );
        })}
      </MapContainer>

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
    </Container>
  );
}
