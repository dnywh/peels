"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { css, keyframes, styled } from "next-yak";

const PIN_ENTER_SCALE_MS = 380;
const PIN_ENTER_OPACITY_MS = 160;
const PIN_ENTER_SPRING = "cubic-bezier(0.22, 1.12, 0.36, 1)";
const PIN_ENTER_START_SCALE = 0.58;
const PIN_ENTER_OVERSHOOT_SCALE = 1.05;

const pinEnterScale = keyframes`
  0% {
    transform: scale(${PIN_ENTER_START_SCALE});
  }

  72% {
    transform: scale(${PIN_ENTER_OVERSHOOT_SCALE});
  }

  100% {
    transform: scale(1);
  }
`;

const pinEnterOpacity = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const ClusterPinEnterShell = styled.div<{ $entering?: boolean }>`
  transform-origin: center center;

  @media (prefers-reduced-motion: no-preference) {
    ${({ $entering }) =>
      $entering
        ? css`
            animation:
              ${pinEnterScale} ${PIN_ENTER_SCALE_MS}ms ${PIN_ENTER_SPRING} both,
              ${pinEnterOpacity} ${PIN_ENTER_OPACITY_MS}ms ease-out both;
          `
        : undefined}
  }
`;

const SuppressEnterAnimationContext = createContext({ current: true });

export function ClusterPinEnterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const suppressEnterAnimationRef = useRef(true);

  useEffect(() => {
    suppressEnterAnimationRef.current = false;
  }, []);

  return (
    <SuppressEnterAnimationContext.Provider value={suppressEnterAnimationRef}>
      {children}
    </SuppressEnterAnimationContext.Provider>
  );
}

export default function ClusterPinEnter({
  children,
}: {
  children: React.ReactNode;
}) {
  const suppressEnterAnimationRef = useContext(SuppressEnterAnimationContext);
  const [isEntering] = useState(() => !suppressEnterAnimationRef.current);

  return (
    <ClusterPinEnterShell $entering={isEntering}>
      {children}
    </ClusterPinEnterShell>
  );
}
