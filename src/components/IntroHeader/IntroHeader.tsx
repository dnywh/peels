import DeferredIntroHeaderRotator from "@/components/DeferredIntroHeaderRotator";
import { styled } from "next-yak";

export default function IntroHeader() {
  return (
    <Frame>
      <MapContainer />
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
    opacity: 1;
    transform: scale(1, 1) rotateX(0deg) translateY(0);
    transform-origin: bottom center;
  }
`;

const RotatorLayer = styled.div`
  position: absolute;
  inset: 0;
`;
