"use client";
import { useState, useEffect } from "react";

import MapPin from "@/components/MapPin";
import Avatar from "@/components/Avatar";
import { styled, keyframes } from "@pigment-css/react";

const featuredIntroPhotos = [
  "compost-collective-kc.jpg",
  "shellworks.jpg",
  "kensington.jpg",
];

const exitAnimationSpeed = "150ms";

function IntroHeader() {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [prevPhotoIndex, setPrevPhotoIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevPhotoIndex(photoIndex);
      setPhotoIndex((current) => (current + 1) % featuredIntroPhotos.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [photoIndex]);

  return (
    <MapContainer>
      {/* Checking for prevPhotoIndex prevents exit animation on initial render */}
      {/* Unique keys on MarkerDemo and StyledAvatar cause desired re-renders */}
      {prevPhotoIndex !== null && (
        <>
          <MarkerDemo key={`marker-exit-${prevPhotoIndex}`} isExiting={true}>
            <MapPin selected={true} type="residential" />
          </MarkerDemo>
          <StyledAvatar
            key={`avatar-exit-${prevPhotoIndex}`}
            isExiting={true}
            isDemo={true}
            src={`/avatars/featured/${featuredIntroPhotos[prevPhotoIndex]}`}
            alt="The avatar for a Peels host"
            size="massive"
          />
        </>
      )}

      <MarkerDemo key={`marker-enter-${photoIndex}`} isExiting={false}>
        <MapPin selected={true} type="residential" />
      </MarkerDemo>
      <StyledAvatar
        key={`avatar-enter-${photoIndex}`}
        isExiting={false}
        isDemo={true}
        src={`/avatars/featured/${featuredIntroPhotos[photoIndex]}`}
        alt="The avatar for a Peels host"
        size="massive"
      />
    </MapContainer>
  );
}

export default IntroHeader;

const exitAvatarAnimation = keyframes({
  from: {
    opacity: 1,
    transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(1)",
  },
  to: {
    opacity: 0,
    transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(0.9)",
  },
});

const exitMarkerAnimation = keyframes({
  from: {
    opacity: 1,
    transform: "rotate(12deg) translate(2.75rem, 1rem) scale(1)",
  },
  to: {
    opacity: 0,
    transform: "rotate(12deg)  translate(2.75rem, 1rem) scale(0.9)",
  },
});

const enterAvatarAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "rotate(0deg) translate(-1.5rem, 2rem) scale(0.5)",
  },
  to: {
    opacity: 1,
    transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(1)",
  },
});

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== "isExiting",
})(({ theme }) => ({
  position: "absolute",
  // Set pre-animation attributes
  transform: "rotate(0deg) translate(-1.5rem, 2rem) scale(0.5)",
  opacity: 0,
  // Animate in on load
  animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",
  transformOrigin: "bottom right",

  variants: [
    {
      props: { isExiting: false },
      style: {
        animation: `${enterAvatarAnimation} 400ms forwards`,
        animationDelay: "420ms",
      },
    },
    {
      props: { isExiting: true },
      style: {
        animation: `${exitAvatarAnimation} ${exitAnimationSpeed} forwards`,
        animationDelay: "0ms",
      },
    },
  ],
}));

const enterMarkerAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "rotate(0deg) translate(2.75rem, 2rem) scale(0.5)",
  },
  to: {
    opacity: 1,
    transform: "rotate(12deg) translate(2.75rem, 1rem) scale(1)",
  },
});

const MarkerDemo = styled("div")(({ theme }) => ({
  position: "absolute",
  transform: "rotate(0deg) translate(2.75rem, 2rem) scale(0.5)",
  opacity: 0,
  transformOrigin: "bottom left",
  animationTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",

  variants: [
    {
      props: { isExiting: false },
      style: {
        animation: `${enterMarkerAnimation} 450ms forwards`,
        animationDelay: "220ms",
      },
    },
    {
      props: { isExiting: true },
      style: {
        animation: `${exitMarkerAnimation} ${exitAnimationSpeed} forwards`,
        animationDelay: "0ms",
      },
    },
  ],
}));

const enterMapAnimation = keyframes({
  from: {
    opacity: 0,
    transform: "scale(1, 0.9) rotateX(-10deg) translateY(1rem)",
  },
  to: {
    opacity: 1,
    transform: "scale(1, 1) rotateX(0deg) translateY(0)",
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
  marginBottom: "-2.5rem",

  // Pseudo-element needed to mask only background
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('/map-tiles/hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    maskImage: "radial-gradient(black 0%, transparent 74%)",
    borderRadius: "inherit",
    zIndex: -1,
    // Set pre-animation attributes
    transform: "scale(1, 0.9) rotateX(-10deg) translateY(1rem)",
    opacity: 0,
    // Animate in on load
    animation: `${enterMapAnimation} 1100ms forwards`,
    animationDelay: "0",
    transformOrigin: "bottom center",
  },
}));
