"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Drawer } from "vaul";
import { keyframes, styled } from "next-yak";
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
import { theme } from "@/styles/theme.yak";

import { SIDEBAR_WIDTH } from "../lib/mapUtils";

type MapListingDrawerPanelProps = {
  user: User | null;
  selectedListing: SelectedListing | null;
  isSelectedListingLoading: boolean;
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

const StyledIconButtonAbsolute = styled(IconButton)`
  pointer-events: ${sharedButtonStyles.pointerEvents};
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
`;

const StyledIconButtonStationary = styled(IconButton)`
  pointer-events: ${sharedButtonStyles.pointerEvents};
  position: relative;
`;

const StyledDrawerContent = styled(Drawer.Content)`
  border-bottom: none;
  border-radius: ${theme.corners.base} ${theme.corners.base} 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 97%;
  background: ${theme.colors.background.sunk};
  border: 0.5px solid ${theme.colors.border.base};
  box-shadow: 0px -3px 3px 1px rgba(0, 0, 0, 0.06);
  overflow-x: hidden;

  &::after {
    display: none;
  }

  @media (min-width: 768px) {
    background: ${theme.colors.background.top};
    border-radius: ${theme.corners.base};
    box-shadow: -3px 0px 3px 1px rgba(0, 0, 0, 0.03);
    height: unset;
    top: 24px;
    right: 24px;
    bottom: 24px;
    left: unset;
    outline: none;
    width: ${SIDEBAR_WIDTH};
  }
`;

const StyledDrawerHeader = styled.header`
  flex: 1;
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const StyledDrawerHeaderInner = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background: ${theme.colors.background.sunk};
  border-bottom: 1px solid ${theme.colors.border.base};
  box-shadow: 0px 1px 8px 0px ${theme.colors.border.base};
  transform: translateY(-0.5px);

  @media (min-width: 768px) {
    background: ${theme.colors.background.slight};
    transform: unset;
  }
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  padding: 0 2.5rem;

  & h3,
  & p {
    line-height: 1.15;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    text-overflow: ellipsis;
    padding-block: 0.04rem;
  }

  & h3 {
    font-weight: 500;
    font-size: 0.85rem;
    color: ${theme.colors.text.secondary};
  }

  & p {
    font-size: 0.8rem;
    color: ${theme.colors.text.tertiary};
  }
`;

const StyledDrawerInner = styled.div`
  width: 100%;
  padding: 1rem 0;
  padding-top: 2rem;
  margin-top: -3.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-bottom: 1.5rem;
`;

const DrawerHandleContainer = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
`;

const ButtonSet = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  position: absolute;
  right: 0.75rem;
`;

const NoListingFound = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  color: ${theme.colors.text.secondary};

  & > header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  & > header > * {
    text-align: center;
    text-wrap: balance;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem;
`;

const mapDrawerPulse = keyframes`
  0% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.55;
  }
`;

const SkeletonBlock = styled.div`
  border-radius: ${theme.corners.base};
  background: ${theme.colors.background.slight};
  opacity: 0.85;
  animation: ${mapDrawerPulse} 1.2s ease-in-out infinite;
`;

const SkeletonHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SkeletonText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export default function MapListingDrawerPanel({
  user,
  selectedListing,
  isSelectedListingLoading,
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
  const listingForDisplay =
    isSelectedListingLoading || isListingError(selectedListing)
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
              {isSelectedListingLoading ? (
                <SkeletonHeader>
                  <SkeletonBlock style={{ height: "0.85rem", width: "65%" }} />
                  <SkeletonBlock style={{ height: "0.8rem", width: "40%" }} />
                </SkeletonHeader>
              ) : (
                <>
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
                </>
              )}
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
          {isSelectedListingLoading ? (
            <LoadingState aria-busy={true}>
              <p>{t("Map.loadingListing")}</p>
              <SkeletonBlock style={{ height: "3rem", width: "100%" }} />
              <SkeletonText>
                <SkeletonBlock style={{ height: "1rem", width: "45%" }} />
                <SkeletonBlock style={{ height: "4.5rem", width: "100%" }} />
                <SkeletonBlock style={{ height: "1rem", width: "35%" }} />
                <SkeletonBlock style={{ height: "7rem", width: "100%" }} />
                <SkeletonBlock style={{ height: "1rem", width: "30%" }} />
                <SkeletonBlock style={{ height: "5rem", width: "100%" }} />
              </SkeletonText>
            </LoadingState>
          ) : showErrorPanel ? (
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
