"use client";

import { useEffect, useState } from "react";

type DeviceContext = {
  isDesktop: boolean;
  hasTouch: boolean;
};

export function useDeviceContext() {
  const [deviceContext, setDeviceContext] = useState<DeviceContext>({
    isDesktop: false,
    hasTouch: false,
  });

  useEffect(() => {
    const hasTouch = window.matchMedia("(pointer: coarse)").matches;
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function handleViewportChange(event: MediaQueryList | MediaQueryListEvent) {
      setDeviceContext((previousContext) => ({
        ...previousContext,
        isDesktop: event.matches,
      }));
    }

    handleViewportChange(mediaQuery);
    setDeviceContext((previousContext) => ({
      ...previousContext,
      hasTouch,
    }));

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  return deviceContext;
}
