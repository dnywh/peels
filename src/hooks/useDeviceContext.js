"use client";
import { useState, useEffect } from "react";

export function useDeviceContext() {
  const [deviceContext, setDeviceContext] = useState({
    isDesktop: false,
    hasTouch: false,
  });

  useEffect(() => {
    // Check for touch capability once on mount
    const hasTouch = window.matchMedia("(pointer: coarse)").matches;
    // const hasTouch = 'ontouchstart' in window ||
    //     navigator.maxTouchPoints > 0 ||
    //     navigator.msMaxTouchPoints > 0;

    // Initial viewport check
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function handleViewportChange(e) {
      setDeviceContext((prev) => ({
        ...prev,
        isDesktop: e.matches,
      }));

      console.log("Device context: isDesktop", e.matches);
      console.log("Device context: hasTouch", hasTouch);
    }

    // Set initial states
    handleViewportChange(mediaQuery);
    setDeviceContext((prev) => ({
      ...prev,
      hasTouch,
    }));

    // Listen for viewport changes
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  return deviceContext;
}
