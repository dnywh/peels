import MapBusinessIcon from "../MapBusinessIcon";
import MapCommunityIcon from "../MapCommunityIcon";
import MapResidentialIcon from "../MapResidentialIcon";
import { styled } from "@pigment-css/react";

import type { ListingType } from "@/types/listing";

type MapPinProps = {
  selected?: boolean;
  // Accept any string so callers that hold generic listing types (e.g.
  // LocationSelect) can still pass them in; unknown values just render the
  // default pin without a specialised icon.
  type?: string;
};

const UnselectedPin = styled("div")({
  cursor: "pointer",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const UnselectedPinInner = styled("div")(({ theme }) => ({
  boxShadow: `0 0 0 2.5px ${theme.colors.marker.border}`,
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: theme.colors.text.ui.emptyState, // Backup background color for when type is not specified
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.10)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",

  variants: [
    {
      props: { type: "residential" },
      style: {
        background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(121, 52, 3, 0.2) 100%), ${theme.colors.marker.background.residential}`,
        backgroundBlendMode: "color-burn, normal",
      },
    },
    {
      props: { type: "community" },
      style: {
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), ${theme.colors.marker.background.community}`,
        backgroundBlendMode: "lighten, normal",
      },
    },
    {
      props: { type: "business" },
      style: {
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%), ${theme.colors.marker.background.business}`,
        backgroundBlendMode: "lighten, normal",
      },
    },
  ],
}));

const SelectedPinRing = styled("div")(({ theme }) => ({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: `color-mix(in srgb, ${theme.colors.marker.background.residential} 30%, black 10%)`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const SelectedPinDot = styled("div")(({ theme }) => ({
  width: "0.5rem",
  height: "0.5rem",
  borderRadius: "50%",
  backgroundColor: theme.colors.marker.dot,
  boxShadow: `0 0 1px 1px ${theme.colors.border.elevated}`,
}));

const SelectedPin = styled("div")({
  display: "flex",
  cursor: "pointer",

  [`& ${SelectedPinDot}`]: {
    transition: "transform 75ms ease-in-out",
  },
  [`& ${SelectedPinRing}`]: {
    transition: "transform 75ms ease-in-out",
  },
  "&:hover": {
    [`& ${SelectedPinDot}`]: {
      transform: "scale(1.05)",
    },
    [`& ${SelectedPinRing}`]: {
      transform: "scale(1.25)",
    },
  },
});

// Cast to `any` for the styled() call because Pigment's `variants` inference
// narrows the shared `type` prop to the literal of the first variant, which
// doesn't reflect what we actually want here (a string union).
const SelectedPinIcon = (
  styled("svg") as unknown as (
    arg: unknown
  ) => React.ComponentType<React.SVGProps<SVGSVGElement> & { type?: string }>
)(({ theme }: { theme: any }) => ({
  fill: theme.colors.text.ui.emptyState, // Backup fill for when type is not specified
  stroke: theme.colors.marker.border,
  strokeWidth: "1.5px",
  overflow: "visible",
  width: "3.25rem",
  position: "absolute",
  top: "-0.2rem",
  left: "0",
  transform: "translate(calc(40px - 1.625rem), -50%)",
  filter:
    "drop-shadow(0px 3px 18px rgba(0, 0, 0, 0.12)) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.15))",

  transition: "transform 110ms ease-in-out",
  transformOrigin: "center",

  variants: [
    {
      props: { type: "residential" },
      style: {
        fill: theme.colors.marker.background.residential,
      },
    },
    {
      props: { type: "community" },
      style: {
        fill: theme.colors.marker.background.community,
      },
    },
    {
      props: { type: "business" },
      style: {
        fill: theme.colors.marker.background.business,
      },
    },
  ],
}));

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
        <SelectedPinRing>
          <SelectedPinDot />
        </SelectedPinRing>

        <SelectedPinIcon viewBox="0 0 20 24" type={type}>
          <path d={ICON} />
        </SelectedPinIcon>
        {IconComponent && <IconComponent size="large" />}
      </SelectedPin>
    );
  }

  return (
    <UnselectedPin>
      <UnselectedPinInner type={type ?? ""}>
        {IconComponent && <IconComponent size="normal" />}
      </UnselectedPinInner>
    </UnselectedPin>
  );
}

export default MapPin;
