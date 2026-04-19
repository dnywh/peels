"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { config } from "@maptiler/client";
import type { MapRef } from "react-map-gl/maplibre";
import { styled } from "@pigment-css/react";

import MapImmersive from "@/components/MapImmersive";
import MapSidebar from "@/components/MapSidebar";
import MapListingDrawer from "./MapListingDrawer";

import { useDeviceContext } from "@/hooks/useDeviceContext";
import { useListingsInView } from "@/hooks/useListingsInView";
import { useMapListingUrl } from "@/hooks/useMapListingUrl";
import { useIpInitialLocation } from "@/hooks/useIpInitialLocation";
import { useMapDrawerScroll } from "@/hooks/useMapDrawerScroll";
import {
  ZOOM_LEVEL_DEFAULT,
  type ListingMarker,
  type SelectedListing,
} from "@/utils/mapUtils";

type MapPageClientProps = {
  user: { id: string } | null;
  initialListingSlug?: string | null;
  initialListing?: SelectedListing | null;
};

type GeocodingPickEvent = {
  feature?: { center?: [number, number] };
};

const snapPoints: (number | string)[] = [0.35, 1];

// For IP geolocation API
config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? "";

const StyledMapPage = styled("main")(({ theme }) => ({
  flex: 1,
  gap: theme.spacing.gap.desktop,
  alignItems: "stretch",
  display: "flex",
  flexDirection: "row",
}));

const StyledMapWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  flex: 1,
  height: "100%",
  "@media (min-width: 768px)": {
    borderRadius: theme.corners.base,
    border: `1px solid ${theme.colors.border.base}`,
    overflow: "hidden",
  },
}));

export default function MapPageClient({
  user,
  initialListingSlug,
  initialListing,
}: MapPageClientProps) {
  const mapRef = useRef<MapRef | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const { isDesktop, hasTouch } = useDeviceContext();

  const {
    listingSlug,
    selectedListing,
    selectedListingId,
    isListingSelected,
    selectListingById,
    closeListing,
  } = useMapListingUrl({ user, initialListingSlug, initialListing });

  const { listings, isFetching, requestBounds } = useListingsInView();

  const { initialCoordinates, countryCode } = useIpInitialLocation({
    skip: Boolean(initialListingSlug),
  });

  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const isFullSnap = snap === snapPoints[1];
  const isPartialSnap = snap === snapPoints[0];

  const { drawerContentRef, isDrawerHeaderShown, setIsDrawerHeaderShown } =
    useMapDrawerScroll({
      isDesktop,
      isFullSnap,
      isListingSelected,
    });

  // Snap to full on desktop, partial on mobile.
  useEffect(() => {
    if (isDesktop) {
      setSnap(snapPoints[1]);
    }
  }, [isDesktop]);

  // Manage html classes that other styles hook into. Only on mobile — desktop
  // doesn't take over the viewport.
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
  }, [isFullSnap, isDesktop, listingSlug]);

  // Keep drawer/html state consistent with URL changes (including browser
  // back/forward). Also resets scroll + header when a new listing opens.
  useEffect(() => {
    if (!listingSlug) {
      document.documentElement.classList.remove("drawer-fully-open");
      setSnap(snapPoints[0]);
      setIsChatDrawerOpen(false);
    } else {
      setSnap(snapPoints[0]);
      setIsDrawerHeaderShown(false);
      if (drawerContentRef.current) {
        drawerContentRef.current.scrollTop = 0;
      }
    }
  }, [listingSlug, drawerContentRef, setIsDrawerHeaderShown]);

  const handleSnapChange = useCallback(() => {
    setSnap((previous) => {
      const next = previous === snapPoints[0] ? snapPoints[1] : snapPoints[0];
      if (next === snapPoints[0] && drawerContentRef.current) {
        drawerContentRef.current.scrollTop = 0;
      }
      return next;
    });
  }, [drawerContentRef]);

  const handleMarkerClick = useCallback(
    (listing: ListingMarker) => {
      if (listing.id === selectedListingId && isListingSelected) return;

      setIsChatDrawerOpen(false);
      setIsDrawerHeaderShown(false);
      if (drawerContentRef.current) {
        drawerContentRef.current.scrollTop = 0;
      }

      // Optimistic pin grow + single fetch (selectListingById sets the
      // optimistic id synchronously, fetches by id, then pushes the URL).
      void selectListingById(listing.id);
    },
    [
      isListingSelected,
      selectListingById,
      selectedListingId,
      drawerContentRef,
      setIsDrawerHeaderShown,
    ]
  );

  const handleMapClick = useCallback(() => {
    if (isListingSelected) {
      closeListing();
    }
  }, [closeListing, isListingSelected]);

  const handleSearchPick = useCallback((event: GeocodingPickEvent) => {
    // Quirk in MapTiler's Geocoding component: tapping close is also an
    // "onPick" with no center. Ignore those.
    const center = event?.feature?.center;
    if (!center) return;

    mapRef.current?.flyTo({
      center: [center[0], center[1]],
      duration: 3200,
      zoom: ZOOM_LEVEL_DEFAULT,
    });
  }, []);

  const handleDrawerOpenChange = useCallback(() => {
    // Drawer-driven close (e.g. escape key on desktop) should also update
    // the URL.
    if (isListingSelected) {
      closeListing();
    }
  }, [closeListing, isListingSelected]);

  return (
    <StyledMapPage>
      <StyledMapWrapper>
        <Drawer.Root
          direction={isDesktop ? "right" : undefined}
          snapPoints={snapPoints}
          activeSnapPoint={isDesktop ? 1 : snap}
          setActiveSnapPoint={setSnap}
          modal={isDesktop ? false : isFullSnap}
          open={isListingSelected}
          onOpenChange={handleDrawerOpenChange}
        >
          <MapImmersive
            mapRef={mapRef}
            searchInputRef={searchInputRef}
            listings={listings}
            isFetching={isFetching}
            selectedListing={selectedListing}
            selectedListingId={selectedListingId}
            listingSlug={listingSlug}
            initialCoordinates={initialCoordinates}
            onBoundsChange={requestBounds}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            onSearchPick={handleSearchPick}
            DrawerTrigger={Drawer.Trigger}
            isDesktop={isDesktop}
            countryCode={countryCode}
          />

          <MapListingDrawer
            user={user}
            selectedListing={selectedListing}
            isDesktop={isDesktop}
            hasTouch={hasTouch}
            isDrawerHeaderShown={isDrawerHeaderShown}
            isFullSnap={isFullSnap}
            isPartialSnap={isPartialSnap}
            onToggleSnap={handleSnapChange}
            onClose={closeListing}
            isChatDrawerOpen={isChatDrawerOpen}
            setIsChatDrawerOpen={setIsChatDrawerOpen}
            drawerContentRef={drawerContentRef}
          />
        </Drawer.Root>
      </StyledMapWrapper>
      {isDesktop && <MapSidebar user={user} covered={isListingSelected} />}
    </StyledMapPage>
  );
}
