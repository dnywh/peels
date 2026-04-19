"use client";

import { useCallback } from "react";
import { Drawer } from "vaul";
import { styled } from "@pigment-css/react";
import type { User } from "@supabase/supabase-js";

import { useDeviceContext } from "@/hooks/useDeviceContext";
import type { Listing, ListingMarker } from "@/types/listing";

import MapView from "./MapView";
import MapListingDrawerPanel from "./MapListingDrawerPanel";
import MapSidebar from "./MapSidebar";
import { useMapListingUrl } from "../hooks/useMapListingUrl";
import { useIpInitialLocation } from "../hooks/useIpInitialLocation";
import {
  MAP_DRAWER_SNAP_POINTS,
  useMapDrawerState,
} from "../hooks/useMapDrawerState";

type MapPageClientProps = {
  user: User | null;
  initialListingSlug?: string | null;
  initialListing?: Listing | null;
};

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
  const { isDesktop, hasTouch } = useDeviceContext();

  const {
    listingSlug,
    selectedListing,
    selectedListingId,
    isListingSelected,
    selectListingById,
    closeListing,
  } = useMapListingUrl({ user, initialListingSlug, initialListing });

  const { initialCoordinates, countryCode } = useIpInitialLocation({
    skip: Boolean(initialListingSlug),
  });

  const {
    drawerContentRef,
    snap,
    setSnap,
    isFullSnap,
    isPartialSnap,
    isDrawerHeaderShown,
    handleSnapChange,
  } = useMapDrawerState({ isDesktop, listingSlug, isListingSelected });

  const handleMarkerClick = useCallback(
    (listing: ListingMarker) => {
      if (listing.id === selectedListingId && isListingSelected) return;

      // Optimistic pin grow + single fetch (selectListingById sets the
      // optimistic id synchronously, fetches by id, then pushes the URL).
      void selectListingById(listing.id);
    },
    [isListingSelected, selectListingById, selectedListingId]
  );

  const handleMapClick = useCallback(() => {
    if (isListingSelected) {
      closeListing();
    }
  }, [closeListing, isListingSelected]);

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
          snapPoints={MAP_DRAWER_SNAP_POINTS}
          activeSnapPoint={isDesktop ? 1 : snap}
          setActiveSnapPoint={setSnap}
          modal={isDesktop ? false : isFullSnap}
          open={isListingSelected}
          onOpenChange={handleDrawerOpenChange}
        >
          <MapView
            selectedListing={selectedListing}
            selectedListingId={selectedListingId}
            listingSlug={listingSlug}
            initialCoordinates={initialCoordinates}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            DrawerTrigger={Drawer.Trigger}
            isDesktop={isDesktop}
            countryCode={countryCode}
          />

          <MapListingDrawerPanel
            user={user}
            selectedListing={selectedListing}
            isDesktop={isDesktop}
            hasTouch={hasTouch}
            isDrawerHeaderShown={isDrawerHeaderShown}
            isFullSnap={isFullSnap}
            isPartialSnap={isPartialSnap}
            onToggleSnap={handleSnapChange}
            onClose={closeListing}
            drawerContentRef={drawerContentRef}
          />
        </Drawer.Root>
      </StyledMapWrapper>
      {isDesktop && <MapSidebar user={user} covered={isListingSelected} />}
    </StyledMapPage>
  );
}
