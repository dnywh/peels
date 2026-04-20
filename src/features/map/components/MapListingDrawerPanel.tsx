"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Drawer } from "vaul";
import { styled } from "@pigment-css/react";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";

import ListingRead from "@/components/ListingRead";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import {
  getListingDisplayName,
  getListingDisplayType,
} from "@/utils/listingUtils";
import { isListingError, type SelectedListing } from "@/types/listing";

import { SIDEBAR_WIDTH } from "../lib/mapUtils";

type MapListingDrawerPanelProps = {
  user: User | null;
  selectedListing: SelectedListing | null;
  isDesktop: boolean;
  hasTouch: boolean;
  isDrawerHeaderShown: boolean;
  isFullSnap: boolean;
  isPartialSnap: boolean;
  onToggleSnap: () => void;
  onClose: () => void;
  drawerContentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const sharedButtonStyles = {
  pointerEvents: "all" as const,
};

const StyledIconButtonAbsolute = styled(IconButton)({
  ...sharedButtonStyles,
  position: "absolute",
  right: "0.75rem",
});

const StyledIconButtonStationary = styled(IconButton)({
  ...sharedButtonStyles,
  position: "relative",
});

const StyledDrawerContent = styled(Drawer.Content)(({ theme }) => ({
  borderBottom: "none",
  borderRadius: `${theme.corners.base} ${theme.corners.base} 0 0`,

  position: "fixed",
  bottom: "0",
  left: "0",
  right: "0",

  height: "97%", // Take up full height to prevent awkward drawer pop-ups when minimal content

  background: theme.colors.background.sunk,

  border: `0.5px solid ${theme.colors.border.base}`,
  boxShadow: `0px -3px 3px 1px rgba(0, 0, 0, 0.06)`,

  overflowX: "hidden",

  "&::after": {
    display: "none", // Otherwise seems to visibly block the drawer content
  },

  "@media (min-width: 768px)": {
    background: theme.colors.background.top,
    borderRadius: theme.corners.base,
    boxShadow: `-3px 0px 3px 1px rgba(0, 0, 0, 0.03)`,

    height: "unset",
    top: "24px",
    right: "24px",
    bottom: "24px",
    left: "unset",
    outline: "none",
    width: SIDEBAR_WIDTH,
  },
}));

const StyledDrawerHeader = styled("header")({
  flex: 1,

  position: "sticky",
  top: "0",
  // Create a new stacking context to ensure header content stays above
  // avatar whose rotation transform caused a new stacking context
  zIndex: 1,
  width: "100%",

  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
});

const StyledDrawerHeaderInner = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",

  padding: "1rem",
  background: theme.colors.background.sunk,
  borderBottom: `1px solid ${theme.colors.border.base}`,
  boxShadow: `0px 1px 8px 0px ${theme.colors.border.base}`,

  transform: "translateY(-0.5px)", // Avoid clipping on Retina screens

  "@media (min-width: 768px)": {
    background: theme.colors.background.slight,
    transform: "unset",
  },
}));

const StyledHeaderText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  width: "100%",
  padding: "0 2.5rem", // Padding to account for the icon button

  "& h3, p": {
    lineHeight: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    display: "block",
    textOverflow: "ellipsis",
  },
  "& h3": {
    fontWeight: "500",
    fontSize: "0.85rem",
    color: theme.colors.text.secondary,
  },
  "& p": {
    fontSize: "0.8rem",
    color: theme.colors.text.tertiary,
  },
}));

const StyledDrawerInner = styled("div")({
  width: "100%",
  padding: "1rem 0", // Commented out X axis to allow overflow for things like photo x-scroll
  paddingTop: "2rem",
  marginTop: "-3.5rem", // To account for sticky header

  overflowY: "auto",
  overflowX: "hidden", // Prevent horizontal scrolling

  display: "flex",
  flexDirection: "column",
  gap: "3rem", // Match in ListingRead
  marginBottom: "1.5rem", // Visual buffer
});

const DrawerHandleContainer = styled("div")({
  position: "absolute",
  top: "0.5rem",
  left: "50%",
  transform: "translateX(-50%)",
});

const ButtonSet = styled("div")({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
  position: "absolute",
  right: "0.75rem",
});

const NoListingFound = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  padding: "2rem",
  color: theme.colors.text.secondary,

  "& > header": {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",

    "& > *": {
      textAlign: "center",
      textWrap: "balance",
    },
  },
}));

export default function MapListingDrawerPanel({
  user,
  selectedListing,
  isDesktop,
  hasTouch,
  isDrawerHeaderShown,
  isFullSnap,
  isPartialSnap,
  onToggleSnap,
  onClose,
  drawerContentRef,
}: MapListingDrawerPanelProps) {
  const t = useTranslations();

  const showErrorPanel = isListingError(selectedListing);
  const listingForDisplay = isListingError(selectedListing)
    ? null
    : selectedListing;

  return (
    <Drawer.Portal>
      <StyledDrawerContent
        ref={drawerContentRef}
        data-vaul-no-drag={isDesktop ? true : undefined}
        style={{
          overflowY: isFullSnap || isDesktop ? "auto" : "hidden",
        }}
      >
        <VisuallyHidden.Root>
          <Drawer.Title>{t("Map.drawerTitle")}</Drawer.Title>
          <Drawer.Description>{t("Map.drawerDescription")}</Drawer.Description>
        </VisuallyHidden.Root>

        <StyledDrawerHeader
          style={{
            pointerEvents: isDrawerHeaderShown ? "auto" : "none",
            userSelect: isDrawerHeaderShown ? "auto" : "none",
          }}
        >
          <StyledDrawerHeaderInner
            style={{
              transition: "opacity 75ms ease",
              opacity: isDrawerHeaderShown ? 1 : 0,
            }}
          >
            <StyledHeaderText>
              <h3 style={{ fontSize: "0.85rem" }}>
                {listingForDisplay
                  ? getListingDisplayName(listingForDisplay, user)
                  : ""}
              </h3>
              <p>
                {listingForDisplay
                  ? getListingDisplayType(listingForDisplay)
                  : ""}
              </p>
            </StyledHeaderText>
          </StyledDrawerHeaderInner>

          {!isDesktop ? (
            <ButtonSet>
              <StyledIconButtonStationary
                icon={isPartialSnap ? "maximize" : "minimize"}
                onClick={onToggleSnap}
              />
              <StyledIconButtonStationary icon="close" onClick={onClose} />
            </ButtonSet>
          ) : (
            <StyledIconButtonAbsolute icon="close" onClick={onClose} />
          )}

          {hasTouch && !isDesktop && (
            <DrawerHandleContainer
              style={{
                display: isDrawerHeaderShown ? "none" : "inherit",
              }}
            >
              <Drawer.Handle />
            </DrawerHandleContainer>
          )}
        </StyledDrawerHeader>

        <StyledDrawerInner>
          {showErrorPanel ? (
            <NoListingFound>
              <header>
                <h2>{t("Map.emptyTitle")}</h2>
                <p>{t("Map.emptyBody")}</p>
              </header>
              <Button variant="secondary" onClick={onClose}>
                {t("Actions.close")}
              </Button>
            </NoListingFound>
          ) : (
            <ListingRead
              key={listingForDisplay?.id ?? "empty"}
              user={user}
              listing={listingForDisplay}
              presentation="drawer"
            />
          )}
        </StyledDrawerInner>
      </StyledDrawerContent>
    </Drawer.Portal>
  );
}
