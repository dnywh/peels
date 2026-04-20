"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SNAP_POINTS } from "../lib/mapUtils";

type SnapPoint = number | string | null;

type UseMapDrawerStateArgs = {
  isDesktop: boolean;
  listingSlug: string | null;
  isListingSelected: boolean;
};

type UseMapDrawerStateResult = {
  drawerContentRef: React.MutableRefObject<HTMLDivElement | null>;
  snap: SnapPoint;
  setSnap: React.Dispatch<React.SetStateAction<SnapPoint>>;
  isFullSnap: boolean;
  isPartialSnap: boolean;
  isDrawerHeaderShown: boolean;
  resetDrawer: () => void;
  handleSnapChange: () => void;
};

const SCROLL_THRESHOLD = 16;

export const MAP_DRAWER_SNAP_POINTS: (number | string)[] = [
  SNAP_POINTS.partial,
  SNAP_POINTS.full,
];

// Single owner for every piece of mobile/desktop drawer state that used to
// live spread across MapPageClient and useMapDrawerScroll:
// - snap point + derived flags
// - drawerContentRef + sticky-header visibility (desktop uses a portalled
//   drawer, so we also watch the DOM for the drawer mounting)
// - the "map" / "drawer-fully-open" html class toggles on mobile
// - the scroll/snap/header reset when the selected listing changes
export function useMapDrawerState({
  isDesktop,
  listingSlug,
  isListingSelected,
}: UseMapDrawerStateArgs): UseMapDrawerStateResult {
  const drawerContentRef = useRef<HTMLDivElement | null>(null);
  const [snap, setSnap] = useState<SnapPoint>(SNAP_POINTS.partial);
  const [isDrawerHeaderShown, setIsDrawerHeaderShown] = useState(false);

  const isFullSnap = snap === SNAP_POINTS.full;
  const isPartialSnap = snap === SNAP_POINTS.partial;

  const resetDrawer = useCallback(() => {
    document.documentElement.classList.remove("drawer-fully-open");
    setSnap(SNAP_POINTS.partial);
    setIsDrawerHeaderShown(false);
    if (drawerContentRef.current) {
      drawerContentRef.current.scrollTop = 0;
    }
  }, []);

  // Snap to full on desktop. On mobile we stay at the partial snap until the
  // user explicitly expands or a new listing is opened.
  useEffect(() => {
    if (isDesktop) {
      setSnap(SNAP_POINTS.full);
    }
  }, [isDesktop]);

  // Mobile-only html class toggles that other styles hook into. Desktop does
  // not take over the viewport, so we don't touch the html classes there.
  useEffect(() => {
    if (isDesktop) return;

    document.documentElement.classList.add("map");

    if (isFullSnap && listingSlug) {
      document.documentElement.classList.add("drawer-fully-open");
    } else {
      document.documentElement.classList.remove("drawer-fully-open");
    }

    return () => {
      document.documentElement.classList.remove("map");
      document.documentElement.classList.remove("drawer-fully-open");
    };
  }, [isDesktop, isFullSnap, listingSlug]);

  // Reset snap + scroll + sticky header whenever the selected listing
  // changes (including browser back/forward).
  useEffect(() => {
    if (!listingSlug) {
      resetDrawer();
      return;
    }

    resetDrawer();
  }, [listingSlug, resetDrawer]);

  // Mobile: we can attach the scroll handler directly when the drawer is
  // fully snapped because the drawer content is the scroll container.
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

  // Desktop: the drawer is portalled, so it may not be in the tree on the
  // first render. If the ref is already set by the time this effect runs
  // (common on subsequent listing changes), attach directly; otherwise fall
  // back to a MutationObserver that attaches once the portal mounts.
  useEffect(() => {
    if (!isDesktop || !isListingSelected) return;

    let attachedTo: HTMLElement | null = null;

    const handleScroll = () => {
      if (attachedTo) {
        setIsDrawerHeaderShown(attachedTo.scrollTop > SCROLL_THRESHOLD);
      }
    };

    const attach = (element: HTMLElement) => {
      attachedTo = element;
      element.addEventListener("scroll", handleScroll);
    };

    let observer: MutationObserver | null = null;

    if (drawerContentRef.current) {
      attach(drawerContentRef.current);
    } else {
      observer = new MutationObserver(() => {
        const drawerContent = drawerContentRef.current;
        if (drawerContent) {
          attach(drawerContent);
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      observer?.disconnect();
      attachedTo?.removeEventListener("scroll", handleScroll);
    };
  }, [isDesktop, isListingSelected]);

  const handleSnapChange = useCallback(() => {
    setSnap((previous) => {
      const next =
        previous === SNAP_POINTS.partial
          ? SNAP_POINTS.full
          : SNAP_POINTS.partial;
      if (next === SNAP_POINTS.partial && drawerContentRef.current) {
        drawerContentRef.current.scrollTop = 0;
      }
      return next;
    });
  }, []);

  return {
    drawerContentRef,
    snap,
    setSnap,
    isFullSnap,
    isPartialSnap,
    isDrawerHeaderShown,
    resetDrawer,
    handleSnapChange,
  };
}
