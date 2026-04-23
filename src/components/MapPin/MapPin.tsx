import MapBusinessIcon from "../MapBusinessIcon";
import MapCommunityIcon from "../MapCommunityIcon";
import MapResidentialIcon from "../MapResidentialIcon";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

import type { ListingType } from "@/types/listing";

type MapPinProps = {
  selected?: boolean;
  // Accept any string so callers that hold generic listing types (e.g.
  // LocationSelect) can still pass them in; unknown values just render the
  // default pin without a specialised icon.
  type?: string;
};

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

const UnselectedPin = styled.div`
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const UnselectedPinInner = styled.div<{ $type?: string }>`
  box-shadow: 0 0 0 2.5px ${theme.colors.marker.border};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${theme.colors.text.ui.emptyState};
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.1))
    drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15));

  ${({ $type }) => $type === "residential" && residentialPinStyles}
  ${({ $type }) => $type === "community" && communityPinStyles}
  ${({ $type }) => $type === "business" && businessPinStyles}
`;

const SelectedPinRing = styled.div<{ $type?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ $type }) => {
    if ($type === "community") return communitySelectedRingStyles;
    if ($type === "business") return businessSelectedRingStyles;
    return residentialSelectedRingStyles;
  }}
`;

const SelectedPinDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${theme.colors.marker.dot};
  box-shadow: 0 0 1px 1px ${theme.colors.border.elevated};
`;

const SelectedPin = styled.div`
  display: flex;
  cursor: pointer;

  ${SelectedPinDot},
  ${SelectedPinRing} {
    transition: transform 75ms ease-in-out;
  }

  &:hover ${SelectedPinDot} {
    transform: scale(1.05);
  }

  &:hover ${SelectedPinRing} {
    transform: scale(1.25);
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
  filter: drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.12))
    drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15));
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

function MapPin({ selected = false, type }: MapPinProps) {
  const IconComponent = isListingPinType(type) ? iconMap[type] : null;

  if (selected) {
    return (
      <SelectedPin>
        <SelectedPinRing $type={type}>
          <SelectedPinDot />
        </SelectedPinRing>

        <SelectedPinIcon viewBox="0 0 20 24" $type={type}>
          <path d={ICON} />
        </SelectedPinIcon>
        {IconComponent && <IconComponent size="large" />}
      </SelectedPin>
    );
  }

  return (
    <UnselectedPin>
      <UnselectedPinInner $type={type ?? ""}>
        {IconComponent && <IconComponent size="normal" />}
      </UnselectedPinInner>
    </UnselectedPin>
  );
}

export default MapPin;
