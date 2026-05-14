"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import { keyframes, styled } from "next-yak";
import type { GeocodingFeature } from "@maptiler/client";

import IconButton from "@/components/IconButton";
import { theme } from "@/styles/theme.yak";
import GeocodingSearch from "./GeocodingSearch";

type MapSearchProps = {
  countryCode?: string | null;
  onOpenChange: (open: boolean) => void;
  onPick: (feature: GeocodingFeature) => void;
  open: boolean;
};

const overlayEnter = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const overlayExit = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`;

const contentEnter = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 0.375rem);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const contentExit = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  to {
    opacity: 0;
    transform: translate(-50%, 0.25rem);
  }
`;

const DialogOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 4;
  background: rgba(0, 0, 0, 0.4);

  @media (prefers-color-scheme: dark) {
    background: rgba(0, 0, 0, 0.62);
  }

  &[data-state="open"] {
    animation: ${overlayEnter} 140ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${overlayExit} 110ms ease-in;
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-state="open"],
    &[data-state="closed"] {
      animation: none;
    }
  }
`;

const DialogContent = styled(Dialog.Content)`
  position: fixed;
  left: 50%;
  top: 18vh;
  z-index: 5;
  width: min(calc(100vw - 2rem), 38rem);
  transform: translateX(-50%);
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: calc(${theme.corners.base} * 1.35);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.24);
  padding: 0.75rem;

  &[data-state="open"] {
    animation: ${contentEnter} 160ms ease-out;
  }

  &[data-state="closed"] {
    animation: ${contentExit} 110ms ease-in;
  }

  @media (prefers-reduced-motion: reduce) {
    &[data-state="open"],
    &[data-state="closed"] {
      animation: none;
    }
  }
`;

const DialogCloseButton = styled(IconButton)`
  position: absolute;
  right: -0.625rem;
  top: -0.625rem;
  border-radius: 0.7rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
`;

export default function MapSearch({
  countryCode,
  onOpenChange,
  onPick,
  open,
}: MapSearchProps) {
  const actionsT = useTranslations("Actions");
  const mapT = useTranslations("Map");
  const closeLabel = actionsT("close");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent data-testid="map-search-dialog">
          <VisuallyHidden.Root>
            <Dialog.Title>{mapT("searchDialogTitle")}</Dialog.Title>
            <Dialog.Description>{mapT("searchPlaceholder")}</Dialog.Description>
          </VisuallyHidden.Root>
          <GeocodingSearch
            ariaLabel={mapT("searchDialogTitle")}
            autoFocus={true}
            clearLabel={mapT("searchClear")}
            countryCode={countryCode}
            errorMessage={mapT("searchError")}
            loadingMessage={mapT("searchLoading")}
            noResultsMessage={mapT("searchNoResults")}
            onPick={(feature) => {
              onPick(feature);
              onOpenChange(false);
            }}
            placeholder={mapT("searchPlaceholder")}
            proximity="ip"
            variant="palette"
          />
          <Dialog.Close asChild>
            <DialogCloseButton
              icon="close"
              aria-label={closeLabel}
              title={closeLabel}
              type="button"
            />
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
