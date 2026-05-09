import Avatar from "@/components/Avatar";
import DeferredIntroHeaderRotator from "@/components/DeferredIntroHeaderRotator";
import MapPin from "@/components/MapPin";
import { css, keyframes, styled } from "next-yak";

const avatarVisible = {
  opacity: 1,
  transform: "rotate(-15deg) translate(-1.5rem, -1rem) scale(1)",
};
const markerVisible = {
  opacity: 1,
  transform: "rotate(12deg) translate(2.75rem, 1rem) scale(1)",
};
const mapEnter = {
  opacity: 0,
  transform: "scale(1, 0.9) rotateX(-10deg) translateY(1rem)",
};
const mapVisible = {
  opacity: 1,
  transform: "scale(1, 1) rotateX(0deg) translateY(0)",
};

const mapEnterAnimation = keyframes`
  from {
    opacity: ${mapEnter.opacity};
    transform: ${mapEnter.transform};
  }

  to {
    opacity: ${mapVisible.opacity};
    transform: ${mapVisible.transform};
  }
`;

const staticHeroItem = {
  type: "residential",
  photo: "compost-collective-kc.jpg",
} as const;

export default function IntroHeader() {
  return (
    <Frame>
      <MapContainer>
        <MarkerDemo>
          <MapPin selected={true} type={staticHeroItem.type} />
        </MarkerDemo>
        <StyledAvatar
          isDemo={true}
          src={`/avatars/featured/${staticHeroItem.photo}`}
          alt=""
          size="massive"
          priority
        />
      </MapContainer>
      <RotatorLayer aria-hidden="true">
        <DeferredIntroHeaderRotator />
      </RotatorLayer>
    </Frame>
  );
}

const Frame = styled.div`
  position: relative;
  width: 100%;
  max-width: 36rem;
  height: 16rem;
  margin-bottom: -2.5rem;
`;

const sharedMapContainerStyles = css`
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
    animation: ${mapEnterAnimation} 1100ms forwards;
    animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.055);
    transform-origin: bottom center;
  }
`;

const MapContainer = styled.div`
  ${sharedMapContainerStyles}
`;

const RotatorLayer = styled.div`
  position: absolute;
  inset: 0;
`;

const StyledAvatar = styled(Avatar)`
  position: absolute;
  opacity: ${avatarVisible.opacity};
  transform: ${avatarVisible.transform};
  transform-origin: bottom right;
`;

const MarkerDemo = styled.div`
  position: absolute;
  opacity: ${markerVisible.opacity};
  transform: ${markerVisible.transform};
  transform-origin: bottom left;
`;
