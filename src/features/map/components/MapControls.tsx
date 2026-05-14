"use client";

import { css, styled } from "next-yak";

import {
  MapControlGpsIcon,
  MapControlMinusIcon,
  MapControlPlusIcon,
  MapControlSearchIcon,
} from "@/components/MapControlIcons";
import { theme } from "@/styles/theme.yak";

type MapControlClusterProps = {
  controlsLabel: string;
  locateActive?: boolean;
  locateLabel?: string;
  onLocate?: () => void;
  onSearch?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  searchLabel?: string;
  zoomInDisabled?: boolean;
  zoomInLabel: string;
  zoomOutLabel: string;
  zoomControlsLabel: string;
};

type MapZoomControlsProps = {
  controlsLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInDisabled?: boolean;
  zoomInLabel: string;
  zoomOutLabel: string;
};

const controlButtonStyles = css`
  appearance: none;
  border: 0;
  background: ${theme.colors.background.top};
  box-shadow: var(--map-control-shadow, none);
  color: ${theme.colors.text.ui.emptyState};
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 100ms ease-in-out;

  &:hover {
    background: color-mix(
      in srgb,
      ${theme.colors.background.top},
      ${theme.colors.background.sunk} 35%
    );
  }

  &:active {
    background: color-mix(
      in srgb,
      ${theme.colors.background.top},
      ${theme.colors.background.sunk} 80%
    );
  }

  &:hover svg {
    opacity: 0.75;
    transform: scale(0.9);
  }

  &:active svg {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      inset 0 0 0 2px ${theme.colors.focus.outline},
      var(--map-control-shadow, 0 0 0 0 transparent);
  }

  &:disabled {
    cursor: default;
  }

  &:disabled svg {
    opacity: 0.35;
    transform: none;
  }

  &:disabled:hover,
  &:disabled:active {
    background: ${theme.colors.background.top};
  }

  svg {
    width: 1rem;
    height: 1rem;
    transition:
      opacity 150ms ease-in-out,
      transform 35ms ease-in-out;
  }
`;

const ControlAnchor = styled.div<{ $gap?: boolean }>`
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => ($gap ? "0.375rem" : 0)};
  pointer-events: auto;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  ${controlButtonStyles}
  --map-control-shadow:
    0 0 0 2px ${theme.colors.border.elevated},
    0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
  color: ${({ $active }) =>
    $active ? theme.colors.text.primary : theme.colors.text.ui.emptyState};
  border-radius: 0.7rem;
`;

const ZoomGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.75rem;
  background: ${theme.colors.background.top};
  box-shadow:
    0 0 0 2px ${theme.colors.border.elevated},
    0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
`;

const ZoomButton = styled.button`
  ${controlButtonStyles}
  box-shadow: none;
  border-radius: 0;

  & + & {
    border-top: 1px solid ${theme.colors.border.elevated};
  }
`;

export function MapZoomControls({
  controlsLabel,
  onZoomIn,
  onZoomOut,
  zoomInDisabled = false,
  zoomInLabel,
  zoomOutLabel,
}: MapZoomControlsProps) {
  return (
    <ControlAnchor>
      <ZoomControlGroup
        controlsLabel={controlsLabel}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        zoomInDisabled={zoomInDisabled}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </ControlAnchor>
  );
}

function ZoomControlGroup({
  controlsLabel,
  onZoomIn,
  onZoomOut,
  zoomInDisabled = false,
  zoomInLabel,
  zoomOutLabel,
}: MapZoomControlsProps) {
  return (
    <ZoomGroup role="group" aria-label={controlsLabel}>
      <ZoomButton
        type="button"
        aria-label={zoomInLabel}
        title={zoomInLabel}
        data-testid="map-control-zoom-in"
        disabled={zoomInDisabled}
        onClick={onZoomIn}
      >
        <MapControlPlusIcon aria-hidden="true" />
      </ZoomButton>
      <ZoomButton
        type="button"
        aria-label={zoomOutLabel}
        title={zoomOutLabel}
        data-testid="map-control-zoom-out"
        onClick={onZoomOut}
      >
        <MapControlMinusIcon aria-hidden="true" />
      </ZoomButton>
    </ZoomGroup>
  );
}

export default function MapControls({
  controlsLabel,
  locateActive = false,
  locateLabel,
  onLocate,
  onSearch,
  onZoomIn,
  onZoomOut,
  searchLabel,
  zoomInDisabled = false,
  zoomInLabel,
  zoomControlsLabel,
  zoomOutLabel,
}: MapControlClusterProps) {
  return (
    <ControlAnchor $gap role="group" aria-label={controlsLabel}>
      {onSearch && searchLabel ? (
        <ControlButton
          type="button"
          aria-label={searchLabel}
          title={searchLabel}
          data-testid="map-control-search"
          onClick={onSearch}
        >
          <MapControlSearchIcon aria-hidden="true" />
        </ControlButton>
      ) : null}
      {onLocate && locateLabel ? (
        <ControlButton
          type="button"
          aria-label={locateLabel}
          title={locateLabel}
          $active={locateActive}
          data-testid="map-control-locate"
          onClick={onLocate}
        >
          <MapControlGpsIcon aria-hidden="true" />
        </ControlButton>
      ) : null}
      <ZoomControlGroup
        controlsLabel={zoomControlsLabel}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        zoomInDisabled={zoomInDisabled}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </ControlAnchor>
  );
}
