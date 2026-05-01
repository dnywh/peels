import MapBusinessIcon from "../MapBusinessIcon";
import MapCommunityIcon from "../MapCommunityIcon";
import MapResidentialIcon from "../MapResidentialIcon";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

import type { ListingType } from "@/types/listing";

type MapPinProps = {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  selected?: boolean;
  markerId?: number | string;
  // Accept any string so callers that hold generic listing types (e.g.
  // LocationSelect) can still pass them in; unknown values just render the
  // default pin without a specialised icon.
  type?: string;
};

const PIN_ANIMATION_CURVE = "cubic-bezier(0.175, 0.885, 0.28, 1.12)";
const PIN_MORPH_COLLAPSE_MS = 110;
const PIN_MORPH_DOT_HOLD_MS = PIN_MORPH_COLLAPSE_MS;
const PIN_MORPH_POP_MS = 135;
const PIN_MORPH_REVEAL_DELAY_MS = PIN_MORPH_DOT_HOLD_MS + 35;
const PIN_MORPH_REVEAL_MS = 50;
const PIN_MORPH_COLLAPSED_SCALE = 0.16;
const PIN_OPEN_ENTER_SCALE = 0.88;

const residentialPinStyles = css`
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(121, 52, 3, 0.2) 100%),
    ${theme.colors.marker.background.residential};
  background-blend-mode: color-burn, normal;
`;

const communityPinStyles = css`
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    ${theme.colors.marker.background.community};
  background-blend-mode: lighten, normal;
`;

const businessPinStyles = css`
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    ${theme.colors.marker.background.business};
  background-blend-mode: lighten, normal;
`;

const residentialSelectedRingStyles = css`
  background-color: color-mix(
    in srgb,
    ${theme.colors.marker.background.residential} 30%,
    black 10%
  );
`;

const communitySelectedRingStyles = css`
  background-color: color-mix(
    in srgb,
    ${theme.colors.marker.background.community} 30%,
    black 10%
  );
`;

const businessSelectedRingStyles = css`
  background-color: color-mix(
    in srgb,
    ${theme.colors.marker.background.business} 30%,
    black 10%
  );
`;

const residentialSelectedIconStyles = css`
  fill: ${theme.colors.marker.background.residential};
`;

const communitySelectedIconStyles = css`
  fill: ${theme.colors.marker.background.community};
`;

const businessSelectedIconStyles = css`
  fill: ${theme.colors.marker.background.business};
`;

const PinRoot = styled.div<{ $selected?: boolean }>`
  cursor: pointer;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: relative;
  isolation: isolate;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 1ms !important;
      animation-duration: 1ms !important;
    }
  }
`;

const PinLayer = styled.div`
  position: absolute;
  top: -18px;
  left: -18px;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  transform-origin: center;
`;

const CompactPinLayer = styled(PinLayer)<{ $selected?: boolean }>`
  visibility: ${({ $selected }) => ($selected ? "hidden" : "visible")};
  transform: translateY(${({ $selected }) => ($selected ? "0.125rem" : "0")})
    scale(${({ $selected }) => ($selected ? PIN_MORPH_COLLAPSED_SCALE : 1)});
  transition:
    visibility 0ms
      ${({ $selected }) => ($selected ? "0ms" : `${PIN_MORPH_COLLAPSE_MS}ms`)},
    transform
      ${({ $selected }) =>
        $selected
          ? `${PIN_MORPH_COLLAPSE_MS}ms ease-in`
          : `${PIN_MORPH_POP_MS}ms ${PIN_ANIMATION_CURVE} ${PIN_MORPH_DOT_HOLD_MS}ms`};
  z-index: 2;
`;

const CompactPinHitTarget = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
`;

const CompactPinInner = styled.div<{ $type?: string }>`
  box-shadow:
    0 0 0 2.5px ${theme.colors.marker.border},
    0 3px 14px rgba(0, 0, 0, 0.22),
    0 0 4px rgba(0, 0, 0, 0.22);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${theme.colors.text.ui.emptyState};
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  transform: scale(var(--map-pin-compact-scale, 1));
  transform-origin: center;

  ${({ $type }) => $type === "residential" && residentialPinStyles}
  ${({ $type }) => $type === "community" && communityPinStyles}
  ${({ $type }) => $type === "business" && businessPinStyles}
`;

const CompactPinIcon = styled.div`
  display: flex;
  opacity: var(--map-pin-icon-opacity, 1);
  transform: scale(var(--map-pin-icon-scale, 1));
`;

const SelectedPinRingLayer = styled(PinLayer)<{ $selected?: boolean }>`
  visibility: ${({ $selected }) => ($selected ? "visible" : "hidden")};
  opacity: ${({ $selected }) => ($selected ? 1 : 0)};
  transform: scale(
    ${({ $selected }) => ($selected ? 1 : PIN_OPEN_ENTER_SCALE)}
  );
  transition:
    visibility 0ms
      ${({ $selected }) => ($selected ? "0ms" : `${PIN_MORPH_COLLAPSE_MS}ms`)},
    opacity
      ${({ $selected }) =>
        $selected
          ? `${PIN_MORPH_REVEAL_MS}ms ease-out ${PIN_MORPH_REVEAL_DELAY_MS}ms`
          : `1ms linear ${PIN_MORPH_COLLAPSE_MS}ms`},
    transform
      ${({ $selected }) =>
        $selected
          ? `${PIN_MORPH_POP_MS}ms ${PIN_ANIMATION_CURVE} ${PIN_MORPH_DOT_HOLD_MS}ms`
          : `${PIN_MORPH_COLLAPSE_MS}ms ease-in`};
  will-change: ${({ $selected }) => ($selected ? "transform" : "auto")};
  z-index: 1;
`;

const SelectedPinRing = styled.div<{ $type?: string }>`
  width: 80px;
  height: 80px;
  position: absolute;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 0;
  transform: scale(var(--map-pin-halo-scale, 1));

  ${({ $type }) => {
    if ($type === "community") return communitySelectedRingStyles;
    if ($type === "business") return businessSelectedRingStyles;
    return residentialSelectedRingStyles;
  }}
`;

const SelectedPinDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  position: relative;
  z-index: 1;
  border-radius: 50%;
  background-color: ${theme.colors.marker.dot};
  box-shadow: 0 0 1px 1px ${theme.colors.border.elevated};
  transition: transform 120ms ease-out;
`;

const OpenPinLayer = styled(PinLayer)<{ $selected?: boolean }>`
  visibility: ${({ $selected }) => ($selected ? "visible" : "hidden")};
  opacity: ${({ $selected }) => ($selected ? 1 : 0)};
  pointer-events: ${({ $selected }) => ($selected ? "auto" : "none")};
  cursor: pointer;
  transform: translateY(
      ${({ $selected }) => ($selected ? "-0.375rem" : "0.125rem")}
    )
    scale(${({ $selected }) => ($selected ? 1 : PIN_OPEN_ENTER_SCALE)});
  transition:
    visibility 0ms
      ${({ $selected }) => ($selected ? "0ms" : `${PIN_MORPH_COLLAPSE_MS}ms`)},
    opacity
      ${({ $selected }) =>
        $selected
          ? `${PIN_MORPH_REVEAL_MS}ms ease-out ${PIN_MORPH_REVEAL_DELAY_MS}ms`
          : `1ms linear ${PIN_MORPH_COLLAPSE_MS}ms`},
    transform
      ${({ $selected }) =>
        $selected
          ? `${PIN_MORPH_POP_MS}ms ${PIN_ANIMATION_CURVE} ${PIN_MORPH_DOT_HOLD_MS}ms`
          : `${PIN_MORPH_COLLAPSE_MS}ms ease-in`};
  will-change: ${({ $selected }) => ($selected ? "transform" : "auto")};
  z-index: 3;

  @media (hover: hover) {
    ${PinRoot}:hover & {
      transform: translateY(
          ${({ $selected }) => ($selected ? "-0.5rem" : "0.125rem")}
        )
        scale(${({ $selected }) => ($selected ? 1.025 : PIN_OPEN_ENTER_SCALE)});
    }
  }
`;

const SelectedPinHalo = styled.div`
  display: contents;

  @media (hover: hover) {
    ${PinRoot}:hover & ${SelectedPinRing} {
      transform: scale(calc(var(--map-pin-halo-scale, 1) * 1.035));
    }

    ${PinRoot}:hover & ${SelectedPinDot} {
      transform: scale(1.08);
    }
  }
`;

const SelectedPinIcon = styled.svg<{ $type?: string }>`
  fill: ${theme.colors.text.ui.emptyState};
  stroke: ${theme.colors.marker.border};
  stroke-width: 1.5px;
  overflow: visible;
  width: 3.25rem;
  position: absolute;
  top: -0.2rem;
  left: 0;
  transform: translate(calc(40px - 1.625rem), -50%);
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.14))
    drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.2));
  transition: transform 110ms ease-in-out;
  transform-origin: center;

  ${({ $type }) => {
    if ($type === "community") return communitySelectedIconStyles;
    if ($type === "business") return businessSelectedIconStyles;
    return residentialSelectedIconStyles;
  }}
`;

const ICON = `M18.149 15.8139C18.2078 15.7251 18.2326 15.6533 18.2915 15.5646C19.3387 13.9878 20 12.0412 20 10C20 4.4 15.5 0 10 0C4.5 0 0 4.5 0 10C0 11.8662 0.522404 13.6453 1.40473 15.0937C1.52799 15.296 1.62851 15.5285 1.79602 15.696C1.79734 15.6974 1.79867 15.6987 1.8 15.7C1.90535 15.8054 1.94349 15.9666 2.02739 16.0897C2.18874 16.3264 2.36323 16.5632 2.6 16.8C4.5396 19.1126 7.70356 22.2044 9.18572 23.6258C9.64236 24.0637 10.3577 24.0638 10.8151 23.6266C12.2976 22.2097 15.4607 19.1376 17.4 16.9C17.5711 16.6433 17.8155 16.3866 18.0078 16.1299C18.07 16.0467 18.0918 15.9006 18.149 15.8139Z`;

// Keyed on the shared `ListingType` union so adding a new type there becomes
// a compile error here — prevents the two from drifting out of sync.
const iconMap: Record<ListingType, React.ComponentType<{ size?: string }>> = {
  business: MapBusinessIcon as React.ComponentType<{ size?: string }>,
  community: MapCommunityIcon as React.ComponentType<{ size?: string }>,
  residential: MapResidentialIcon as React.ComponentType<{ size?: string }>,
};

function isListingPinType(value: string | undefined): value is ListingType {
  // Guard against inherited Object.prototype keys like `"toString"` that a
  // plain `value in iconMap` check would accept.
  return (
    value !== undefined && Object.prototype.hasOwnProperty.call(iconMap, value)
  );
}

function MapPin({ onClick, selected = false, markerId, type }: MapPinProps) {
  const IconComponent = isListingPinType(type) ? iconMap[type] : null;

  return (
    <PinRoot
      $selected={selected}
      data-map-pin-id={markerId}
      data-map-pin-state={selected ? "open" : "compact"}
      data-testid="map-pin"
    >
      <SelectedPinRingLayer $selected={selected} data-testid="map-pin-halo">
        <SelectedPinHalo>
          <SelectedPinRing $type={type} />
          <SelectedPinDot />
        </SelectedPinHalo>
      </SelectedPinRingLayer>

      <CompactPinLayer $selected={selected} data-testid="map-pin-compact-layer">
        <CompactPinHitTarget onClick={onClick} />
        <CompactPinInner $type={type ?? ""} data-testid="map-pin-compact-dot">
          <CompactPinIcon data-testid="map-pin-compact-icon">
            {IconComponent && <IconComponent size="normal" />}
          </CompactPinIcon>
        </CompactPinInner>
      </CompactPinLayer>

      <OpenPinLayer
        $selected={selected}
        data-testid="map-pin-open-layer"
        onClick={onClick}
      >
        <SelectedPinIcon viewBox="0 0 20 24" $type={type}>
          <path d={ICON} />
        </SelectedPinIcon>
        {IconComponent && <IconComponent size="large" />}
      </OpenPinLayer>
    </PinRoot>
  );
}

export default MapPin;
