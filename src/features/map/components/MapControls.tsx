"use client";

import { Compass, Minus, Plus, Search } from "lucide-react";
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
  border: 0;
  background: ${theme.colors.background.top};
  color: color-mix(
    in srgb,
    ${theme.colors.text.secondary},
    ${theme.colors.border.base} 46%
  );
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 100ms ease-in-out,
    color 75ms ease-in-out,
    transform 50ms ease-out;

  &:hover {
    color: ${theme.colors.text.primary};
    background: color-mix(
      in srgb,
      ${theme.colors.background.top},
      ${theme.colors.background.sunk} 35%
    );
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
  }

  svg {
    width: 1.125rem;
    height: 1.125rem;
    stroke-width: 2.25px;
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

const ControlButton = styled.button`
  ${controlButtonStyles}
  border-radius: 0.7rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
`;

const ZoomGroup = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.75rem;
  background: ${theme.colors.background.top};
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.13);
`;

const ZoomButton = styled.button`
  ${controlButtonStyles}
  box-shadow: none;
  border-radius: 0;

  & + & {
    border-top: 1px solid
      color-mix(in srgb, ${theme.colors.border.base}, transparent 35%);
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
        <Plus aria-hidden="true" />
      </ZoomButton>
      <ZoomButton
        type="button"
        aria-label={zoomOutLabel}
        title={zoomOutLabel}
        data-testid="map-control-zoom-out"
        onClick={onZoomOut}
      >
        <Minus aria-hidden="true" />
      </ZoomButton>
    </ZoomGroup>
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
          <Search aria-hidden="true" />
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
          <Compass aria-hidden="true" />
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
