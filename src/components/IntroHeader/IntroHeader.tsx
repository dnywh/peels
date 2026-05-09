import DeferredIntroHeaderRotator from "@/components/DeferredIntroHeaderRotator";
import { styled } from "next-yak";

export default function IntroHeader() {
  return (
    <Frame>
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

const RotatorLayer = styled.div`
  position: absolute;
  inset: 0;
`;
