"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import { styled } from "next-yak";
import type { GeocodingFeature } from "@maptiler/client";

import { theme } from "@/styles/theme.yak";
import GeocodingSearch from "./GeocodingSearch";

type MapSearchProps = {
  countryCode?: string | null;
  onOpenChange: (open: boolean) => void;
  onPick: (feature: GeocodingFeature) => void;
  open: boolean;
};

const DialogOverlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 4;
  background: rgba(0, 0, 0, 0.18);
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
`;

export default function MapSearch({
  countryCode,
  onOpenChange,
  onPick,
  open,
}: MapSearchProps) {
  const t = useTranslations("Map");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent data-testid="map-search-dialog">
          <VisuallyHidden.Root>
            <Dialog.Title>{t("searchDialogTitle")}</Dialog.Title>
            <Dialog.Description>{t("searchPlaceholder")}</Dialog.Description>
          </VisuallyHidden.Root>
          <GeocodingSearch
            autoFocus={true}
            clearLabel={t("searchClear")}
            countryCode={countryCode}
            errorMessage={t("searchError")}
            loadingMessage={t("searchLoading")}
            noResultsMessage={t("searchNoResults")}
            onPick={(feature) => {
              onPick(feature);
              onOpenChange(false);
            }}
            placeholder={t("searchPlaceholder")}
            proximity="ip"
            variant="palette"
          />
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
