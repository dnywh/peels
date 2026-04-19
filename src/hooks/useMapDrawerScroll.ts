"use client";

import { useEffect, useRef, useState } from "react";

type UseMapDrawerScrollArgs = {
  isDesktop: boolean;
  // True when the drawer is fully expanded (mobile: snapPoints[1]).
  isFullSnap: boolean;
  isListingSelected: boolean;
};

type UseMapDrawerScrollResult = {
  drawerContentRef: React.MutableRefObject<HTMLDivElement | null>;
  isDrawerHeaderShown: boolean;
  setIsDrawerHeaderShown: React.Dispatch<React.SetStateAction<boolean>>;
};

const SCROLL_THRESHOLD = 16;

// Shows/hides the sticky drawer header based on scroll position.
// - Mobile: attaches directly when the drawer is fully snapped.
// - Desktop: the drawer is portalled, so we wait for it to mount via a
//   MutationObserver, then attach once.
export function useMapDrawerScroll({
  isDesktop,
  isFullSnap,
  isListingSelected,
}: UseMapDrawerScrollArgs): UseMapDrawerScrollResult {
  const drawerContentRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState(false);

  useEffect(() => {
    if (isDesktop || !isFullSnap) {
      setIsDrawerHeaderShown(false);
      return;
    }

    const drawerContent = drawerContentRef.current;
    if (!drawerContent) return;

    const handleScroll = () => {
      setIsDrawerHeaderShown(drawerContent.scrollTop > SCROLL_THRESHOLD);
    };

    drawerContent.addEventListener("scroll", handleScroll);
    return () => {
      drawerContent.removeEventListener("scroll", handleScroll);
    };
  }, [isDesktop, isFullSnap]);

  useEffect(() => {
    if (!isDesktop || !isListingSelected) return;

    const handleScroll = () => {
      if (drawerContentRef.current) {
        setIsDrawerHeaderShown(
          drawerContentRef.current.scrollTop > SCROLL_THRESHOLD
        );
      }
    };

    const observer = new MutationObserver(() => {
      const drawerContent = drawerContentRef.current;
      if (drawerContent) {
        drawerContent.addEventListener("scroll", handleScroll);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      drawerContentRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [isDesktop, isListingSelected]);

  return {
    drawerContentRef,
    isDrawerHeaderShown,
    setIsDrawerHeaderShown,
  };
}
