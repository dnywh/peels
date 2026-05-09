"use client";
import { useState, useEffect } from "react";
import MapPin from "@/components/MapPin";
import Avatar from "@/components/Avatar";
import { css, keyframes, styled } from "next-yak";
import { useTranslations } from "next-intl";

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
    photo: "soil-sisters-singleton.jpg",
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

const exitAvatarAnimation = keyframes`
  from {
    opacity: ${avatarVisible.opacity};
    transform: ${avatarVisible.transform};
  }

  to {
    opacity: ${avatarExit.opacity};
    transform: ${avatarExit.transform};
  }
`;

const exitMarkerAnimation = keyframes`
  from {
    opacity: ${markerVisible.opacity};
    transform: ${markerVisible.transform};
  }

  to {
    opacity: ${markerExit.opacity};
    transform: ${markerExit.transform};
  }
`;

const enterAvatarAnimation = keyframes`
  from {
    opacity: ${avatarEnter.opacity};
    transform: ${avatarEnter.transform};
  }

  to {
    opacity: ${avatarVisible.opacity};
    transform: ${avatarVisible.transform};
  }
`;

const enterMarkerAnimation = keyframes`
  from {
    opacity: ${markerEnter.opacity};
    transform: ${markerEnter.transform};
  }

  to {
    opacity: ${markerVisible.opacity};
    transform: ${markerVisible.transform};
  }
`;

const enteringAvatarStyles = css`
  animation: ${enterAvatarAnimation} ${ANIMATION.TIMING.ENTER.AVATAR}
    ${ANIMATION.CURVE} forwards;
  animation-delay: ${ANIMATION.DELAY.AVATAR};
`;

const exitingAvatarStyles = css`
  animation: ${exitAvatarAnimation} ${ANIMATION.TIMING.EXIT} forwards;
`;

const enteringMarkerStyles = css`
  animation: ${enterMarkerAnimation} ${ANIMATION.TIMING.ENTER.MARKER}
    ${ANIMATION.CURVE} forwards;
  animation-delay: ${ANIMATION.DELAY.MARKER};
`;

const exitingMarkerStyles = css`
  animation: ${exitMarkerAnimation} ${ANIMATION.TIMING.EXIT} forwards;
`;

function IntroHeaderRotator() {
  const t = useTranslations("Index");
  const [itemIndex, setItemIndex] = useState(0);
  const [prevItemIndex, setPrevItemIndex] = useState<number | null>(null);

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
          <MarkerDemo key={`marker-exit-${prevItemIndex}`} $isExiting={true}>
            <MapPin selected={true} type={featuredItems[prevItemIndex].type} />
          </MarkerDemo>
          <StyledAvatar
            key={`avatar-exit-${prevItemIndex}`}
            $isExiting={true}
            isDemo={true}
            src={`/avatars/featured/${featuredItems[prevItemIndex].photo}`}
            alt={t("hostAvatarAlt")}
            size="massive"
          />
        </>
      )}

      <MarkerDemo key={`marker-enter-${itemIndex}`} $isExiting={false}>
        <MapPin selected={true} type={featuredItems[itemIndex].type} />
      </MarkerDemo>
      <StyledAvatar
        key={`avatar-enter-${itemIndex}`}
        $isExiting={false}
        isDemo={true}
        src={`/avatars/featured/${featuredItems[itemIndex].photo}`}
        alt={t("hostAvatarAlt")}
        size="massive"
      />
    </MapContainer>
  );
}

export default IntroHeaderRotator;

const StyledAvatar = styled(Avatar)<{ $isExiting?: boolean }>`
  position: absolute;
  opacity: ${avatarEnter.opacity};
  transform: ${avatarEnter.transform};
  animation-timing-function: ${ANIMATION.CURVE};
  will-change: ${commonAnimationProps.willChange};
  transform-origin: bottom right;

  ${({ $isExiting = false }) =>
    $isExiting ? exitingAvatarStyles : enteringAvatarStyles}
`;

const MarkerDemo = styled.div<{ $isExiting?: boolean }>`
  position: absolute;
  opacity: ${markerEnter.opacity};
  transform: ${markerEnter.transform};
  animation-timing-function: ${ANIMATION.CURVE};
  will-change: ${commonAnimationProps.willChange};
  transform-origin: bottom left;

  ${({ $isExiting = false }) =>
    $isExiting ? exitingMarkerStyles : enteringMarkerStyles}
`;

const enterMapAnimation = keyframes`
  from {
    opacity: ${mapEnter.opacity};
    transform: ${mapEnter.transform};
  }

  to {
    opacity: ${mapVisible.opacity};
    transform: ${mapVisible.transform};
  }
`;

const MapContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 1rem;
  width: 100%;
  max-width: 36rem;
  height: 16rem;
  margin-bottom: -2.5rem;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("/map-tiles/hero.jpg");
    background-size: cover;
    background-position: center;
    mask-image: radial-gradient(black 0%, transparent 74%);
    border-radius: inherit;
    z-index: -1;
    opacity: ${mapEnter.opacity};
    transform: ${mapEnter.transform};
    animation-timing-function: ${ANIMATION.CURVE};
    will-change: ${commonAnimationProps.willChange};
    animation: ${enterMapAnimation} ${ANIMATION.TIMING.ENTER.MAP} forwards;
    transform-origin: bottom center;
  }
`;
