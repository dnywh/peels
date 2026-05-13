"use client";

import { LocateFixed, Minus, Plus, Search } from "lucide-react";
import { css, styled } from "next-yak";

import { theme } from "@/styles/theme.yak";

type MapControlClusterProps = {
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
  border: 1px solid ${theme.colors.border.base};
  border-radius: 999px;
  background: color-mix(
    in srgb,
    ${theme.colors.background.top},
    transparent 6%
  );
  color: ${theme.colors.text.primary};
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.14);
  backdrop-filter: blur(12px);
  transition:
    background 100ms ease-in-out,
    color 75ms ease-in-out,
    transform 50ms ease-out;

  &:hover {
    background: ${theme.colors.background.top};
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
  }
`;

const Cluster = styled.div`
  position: absolute;
  left: 0.75rem;
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
  gap: 0.375rem;
  pointer-events: auto;
`;

const ControlButton = styled.button`
  ${controlButtonStyles}
`;

export function MapZoomControls({
  onZoomIn,
  onZoomOut,
  zoomInLabel,
  zoomOutLabel,
}: MapZoomControlsProps) {
  return (
    <ZoomCluster>
      <ControlButton
        type="button"
        aria-label={zoomInLabel}
        title={zoomInLabel}
        data-testid="map-control-zoom-in"
        onClick={onZoomIn}
      >
        <Plus size={18} aria-hidden="true" />
      </ControlButton>
      <ControlButton
        type="button"
        aria-label={zoomOutLabel}
        title={zoomOutLabel}
        data-testid="map-control-zoom-out"
        onClick={onZoomOut}
      >
        <Minus size={18} aria-hidden="true" />
      </ControlButton>
    </ZoomCluster>
  );
}

export default function MapControls({
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
          <Search size={18} aria-hidden="true" />
        </ControlButton>
      ) : null}
      {onLocate && locateLabel ? (
        <ControlButton
          type="button"
          aria-label={locateLabel}
          title={locateLabel}
          data-testid="map-control-locate"
          onClick={onLocate}
        >
          <LocateFixed size={18} aria-hidden="true" />
        </ControlButton>
      ) : null}
      <ControlButton
        type="button"
        aria-label={zoomInLabel}
        title={zoomInLabel}
        data-testid="map-control-zoom-in"
        onClick={onZoomIn}
      >
        <Plus size={18} aria-hidden="true" />
      </ControlButton>
      <ControlButton
        type="button"
        aria-label={zoomOutLabel}
        title={zoomOutLabel}
        data-testid="map-control-zoom-out"
        onClick={onZoomOut}
      >
        <Minus size={18} aria-hidden="true" />
      </ControlButton>
    </Cluster>
  );
}
