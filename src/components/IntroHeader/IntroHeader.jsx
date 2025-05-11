"use client";
import { useState, useEffect } from "react";
import MapPin from "@/components/MapPin";
import Avatar from "@/components/Avatar";
import { styled, keyframes } from "@pigment-css/react";

const featuredItems = [
  {
    type: "residential",
    photo: "compost-collective-kc.jpg",
  },
  {
    type: "community",
    photo: "scrapdogs-aerial.jpg",
  },
  {
    type: "business",
    photo: "scrapdogs-stand.jpg",
  },
  {
    type: "community",
    photo: "kensington.jpg",
  },
  {
    type: "business",
    photo: "shellworks.jpg",
  },
];

const ANIMATION = {
  TIMING: {
    EXIT: "200ms",
    ENTER: {
      AVATAR: "400ms",
      MARKER: "450ms",
      MAP: "1100ms",
    },
  },
  DELAY: {
    MARKER: "220ms",
    AVATAR: "420ms",
  },
  CURVE: "cubic-bezier(0.175, 0.885, 0.32, 1.055)",
};

const commonAnimationProps = {
  animationTimingFunction: ANIMATION.CURVE,
  willChange: "transform, opacity", // Improve performance for Safari
};

const avatarEnter = {
  opacity: 0,
  transform: "rotate(0deg) translate(-1.5rem, 2rem) scale(0.5)",
};
const avatarVisible = {
  opacity: 1,
  transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(1)",
};
const avatarExit = {
  opacity: 0,
  transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(0.9)",
};
const markerEnter = {
  opacity: 0,
  transform: "rotate(0deg) translate(2.75rem, 2rem) scale(0.5)",
};
const markerVisible = {
  opacity: 1,
  transform: "rotate(12deg) translate(2.75rem, 1rem) scale(1)",
};
const markerExit = {
  opacity: 0,
  transform: "rotate(12deg) translate(2.75rem, 1rem) scale(0.9)",
};

const mapEnter = {
  opacity: 0,
  transform: "scale(1, 0.9) rotateX(-10deg) translateY(1rem)",
};
const mapVisible = {
  opacity: 1,
  transform: "scale(1, 1) rotateX(0deg) translateY(0)",
};

const exitAvatarAnimation = keyframes({
  from: {
    ...avatarVisible,
  },
  to: {
    ...avatarExit,
  },
});

const exitMarkerAnimation = keyframes({
  from: {
    ...markerVisible,
  },
  to: {
    ...markerExit,
  },
});

const enterAvatarAnimation = keyframes({
  from: {
    ...avatarEnter,
  },
  to: {
    ...avatarVisible,
  },
});

const enterMarkerAnimation = keyframes({
  from: {
    ...markerEnter,
  },
  to: {
    ...markerVisible,
  },
});

function IntroHeader() {
  const [itemIndex, setItemIndex] = useState(0);
  const [prevItemIndex, setPrevItemIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevItemIndex(itemIndex);
      setItemIndex((current) => (current + 1) % featuredItems.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [itemIndex]);

  return (
    <MapContainer>
      {/* Checking for prevItemIndex prevents exit animation on initial render */}
      {/* Unique keys on MarkerDemo and StyledAvatar cause desired re-renders */}
      {prevItemIndex !== null && (
        <>
          <MarkerDemo key={`marker-exit-${prevItemIndex}`} isExiting={true}>
            <MapPin selected={true} type={featuredItems[prevItemIndex].type} />
          </MarkerDemo>
          <StyledAvatar
            key={`avatar-exit-${prevItemIndex}`}
            isExiting={true}
            isDemo={true}
            src={`/avatars/featured/${featuredItems[prevItemIndex].photo}`}
            alt="The avatar for a Peels host"
            size="massive"
          />
        </>
      )}

      <MarkerDemo key={`marker-enter-${itemIndex}`} isExiting={false}>
        <MapPin selected={true} type={featuredItems[itemIndex].type} />
      </MarkerDemo>
      <StyledAvatar
        key={`avatar-enter-${itemIndex}`}
        isExiting={false}
        isDemo={true}
        src={`/avatars/featured/${featuredItems[itemIndex].photo}`}
        alt="The avatar for a Peels host"
        size="massive"
      />
    </MapContainer>
  );
}

export default IntroHeader;

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== "isExiting",
})(({ theme }) => ({
  position: "absolute",
  // Set pre-animation attributes
  ...avatarEnter,
  // Animate in on load
  ...commonAnimationProps,
  transformOrigin: "bottom right",

  variants: [
    {
      props: { isExiting: false },
      style: {
        animation: `${enterAvatarAnimation} ${ANIMATION.TIMING.ENTER.AVATAR} ${ANIMATION.CURVE} forwards`,
        animationDelay: ANIMATION.DELAY.AVATAR,
      },
    },
    {
      props: { isExiting: true },
      style: {
        animation: `${exitAvatarAnimation} ${ANIMATION.TIMING.EXIT} forwards`,
      },
    },
  ],
}));

const MarkerDemo = styled("div")(({ theme }) => ({
  position: "absolute",
  // Set pre-animation attributes
  ...markerEnter,
  // Animate in on load
  ...commonAnimationProps,
  transformOrigin: "bottom left",

  variants: [
    {
      props: { isExiting: false },
      style: {
        animation: `${enterMarkerAnimation} ${ANIMATION.TIMING.ENTER.MARKER} ${ANIMATION.CURVE} forwards`,
        animationDelay: ANIMATION.DELAY.MARKER,
      },
    },
    {
      props: { isExiting: true },
      style: {
        animation: `${exitMarkerAnimation} ${ANIMATION.TIMING.EXIT} forwards`,
      },
    },
  ],
}));

const enterMapAnimation = keyframes({
  from: {
    ...mapEnter,
  },
  to: {
    ...mapVisible,
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
    ...mapEnter,
    // Animate in on load
    ...commonAnimationProps,
    animation: `${enterMapAnimation} ${ANIMATION.TIMING.ENTER.MAP} forwards`,
    transformOrigin: "bottom center",
  },
}));
