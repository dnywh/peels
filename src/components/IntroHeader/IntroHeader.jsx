"use client"; // Needed to load StyledNextImage

// import { getListingAvatar } from "@/utils/listing";
import { useState, useEffect } from "react";

import MapPin from "@/components/MapPin";
import Avatar from "@/components/Avatar";
import { styled, keyframes } from "@pigment-css/react";

const featuredIntroPhotos = ["kensington.jpg"];

function IntroHeader() {
  const [randomPhoto, setRandomPhoto] = useState(featuredIntroPhotos[0]);

  useEffect(() => {
    const photo =
      featuredIntroPhotos[
        Math.floor(Math.random() * featuredIntroPhotos.length)
      ];
    setRandomPhoto(photo);
  }, []);

  return (
    <MapContainer>
      <MarkerDemo>
        <MapPin selected={true} type="residential" />
      </MarkerDemo>
      <StyledAvatar
        isDemo={true}
        src={
          randomPhoto
            ? `/avatars/featured/${randomPhoto}`
            : `/avatars/featured/${featuredIntroPhotos[0]}`
        }
        alt="The avatar for a Peels host"
        size="massive"
      />
    </MapContainer>
  );
}

export default IntroHeader;

const enterAvatarAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "rotate(0deg) translate(-3rem, 2rem) scale(0.5)",
  },
  to: {
    opacity: 1,
    transform: "rotate(-15deg) translate(-3rem, -1rem) scale(1)",
  },
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  position: "absolute",
  // Set pre-animation attributes
  transform: "rotate(0deg) translate(-3rem, 2rem) scale(0.5)",
  opacity: 0,
  // Animate in on load
  animation: `${enterAvatarAnimation} 500ms forwards`,
  animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",
  animationDelay: "420ms",
  transformOrigin: "bottom right",
}));

const enterMarkerAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "rotate(0deg) translate(3rem, 2rem) scale(0.5)",
  },
  to: {
    opacity: 1,
    transform: "rotate(12deg) translate(3rem, 0) scale(1)",
  },
});

const MarkerDemo = styled("div")(({ theme }) => ({
  position: "absolute",
  // Set pre-animation attributes
  transform: "rotate(0deg) translate(3rem, 2rem) scale(0.5)",
  opacity: 0,
  // Animate in on load
  animation: `${enterMarkerAnimation} 550ms forwards`,
  animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",
  animationDelay: "220ms",
  transformOrigin: "bottom left",
}));

const enterMapAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.9)",
  },
  to: {
    opacity: 1,
    transform: "scale(1)",
  },
});

const MapContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  borderRadius: "1rem",

  width: "100%",
  maxWidth: "36rem", // 600px
  height: "16rem",
  borderRadius: "1rem",
  // backgroundImage: "url('/map-tiles/demo.png')",
  // backgroundSize: "cover",
  // backgroundPosition: "center",
  // maskImage: "radial-gradient(black 0%, transparent 74%)",
  // Account for optical gap created by gradient
  marginBottom: "-2.5rem",

  // Pseudo-element needed to mask only background
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('/map-tiles/demo.png')",
    transform: "scaleX(-1)", // Flip (TODO not working)
    backgroundSize: "cover",
    backgroundPosition: "center",
    maskImage: "radial-gradient(black 0%, transparent 74%)",
    borderRadius: "inherit",
    zIndex: -1,
    // Set pre-animation attributes
    transform: "scale(0.9)",
    opacity: 0,
    // Animate in on load
    animation: `${enterMapAnimation} 900ms forwards`,
    // animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",
    // animationDelay: "0",
    transformOrigin: "bottom center",
  },
}));
