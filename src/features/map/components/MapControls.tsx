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
  locateActive?: boolean;
  locateLabel?: string;
  onLocate?: () => void;
  onSearch?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  searchLabel?: string;
  zoomInLabel: string;
  zoomOutLabel: string;
};

type MapZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomInLabel: string;
  zoomOutLabel: string;
};

const controlButtonStyles = css`
  appearance: none;
  border: 0;
  background: ${theme.colors.background.top};
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
    outline: 3px solid ${theme.colors.focus.outline};
  }

  svg {
    width: 1rem;
    height: 1rem;
    transition:
      opacity 150ms ease-in-out,
      transform 35ms ease-in-out;
  }
`;

const Cluster = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  pointer-events: auto;
`;

const ZoomCluster = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
`;

const ControlButton = styled.button<{ $active?: boolean }>`
  ${controlButtonStyles}
  color: ${({ $active }) =>
    $active ? theme.colors.text.primary : theme.colors.text.ui.emptyState};
  border-radius: 0.7rem;
  box-shadow:
    0 0 0 2px ${theme.colors.border.elevated},
    0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
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
  onZoomIn,
  onZoomOut,
  zoomInLabel,
  zoomOutLabel,
}: MapZoomControlsProps) {
  return (
    <ZoomCluster>
      <ZoomControlGroup
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </ZoomCluster>
  );
}

function ZoomControlGroup({
  onZoomIn,
  onZoomOut,
  zoomInLabel,
  zoomOutLabel,
}: MapZoomControlsProps) {
  return (
    <ZoomGroup>
      <ZoomButton
        type="button"
        aria-label={zoomInLabel}
        title={zoomInLabel}
        data-testid="map-control-zoom-in"
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
  locateActive = false,
  locateLabel,
  onLocate,
  onSearch,
  onZoomIn,
  onZoomOut,
  searchLabel,
  zoomInLabel,
  zoomOutLabel,
}: MapControlClusterProps) {
  return (
    <Cluster>
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
          aria-pressed={locateActive}
          title={locateLabel}
          $active={locateActive}
          data-testid="map-control-locate"
          onClick={onLocate}
        >
          <MapControlGpsIcon aria-hidden="true" />
        </ControlButton>
      ) : null}
      <ZoomControlGroup
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </Cluster>
  );
}
