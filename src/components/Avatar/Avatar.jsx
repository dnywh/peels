import RemoteImage from "@/components/RemoteImage";
import Image from "next/image";
import { styled } from "@pigment-css/react";

const SIZE_MASSIVE = 112;
const SIZE_LARGE = 96;
const SIZE_MEDIUM = 64;
const SIZE_SMALL = 40;
const SIZE_TINY = 24;

// Base styles that will be shared between both image types
const imageStyles = ({ theme }) => ({
  overflow: "hidden",
  objectFit: "cover",
  flexShrink: 0,
  background: theme.colors.background.pit,

  variants: [
    {
      props: { size: "massive" },
      style: {
        borderRadius: theme.corners.avatar.large,
        boxShadow: `0px 0px 0px 4px ${theme.colors.background.top}, 0px 0px 0px 5.5px ${theme.colors.border.base}, 3px 4px 0px 5px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { size: "large" },
      style: {
        borderRadius: theme.corners.avatar.large,
        boxShadow: `0px 0px 0px 4px ${theme.colors.background.top}, 0px 0px 0px 5.5px ${theme.colors.border.base}, 3px 4px 0px 5px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { size: "medium" },
      style: {
        borderRadius: theme.corners.avatar.large,
        boxShadow: `0px 0px 0px 3px ${theme.colors.background.top}, 0px 0px 0px 4.5px ${theme.colors.border.base}, 2px 3px 0px 3px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { size: "small" },
      style: {
        borderRadius: theme.corners.avatar.small,
        boxShadow: `0px 0px 0px 2px ${theme.colors.background.top}, 0px 0px 0px 3.5px ${theme.colors.border.base}, 2px 2.5px 0px 2.15px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { size: "tiny" },
      style: {
        borderRadius: theme.corners.avatar.small,
        boxShadow: `0px 0px 0px 2px ${theme.colors.background.top}, 0px 0px 0px 3.5px ${theme.colors.border.base}, 2px 2.5px 0px 2.15px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { rotation: "normal" },
      style: {
        transform: `rotate(${theme.rotations.avatar})`,
      },
    },
    {
      props: { rotation: "reverse" },
      style: {
        transform: `rotate(calc(${theme.rotations.avatar} * -1.5))`,
      },
    },
  ],
});

const StyledRemoteImage = styled(RemoteImage)(imageStyles);
const StyledNextImage = styled(Image)(imageStyles);

// Create a size map for cleaner dimension lookup
const SIZE_MAP = {
  massive: SIZE_MASSIVE,
  large: SIZE_LARGE,
  medium: SIZE_MEDIUM,
  small: SIZE_SMALL,
  tiny: SIZE_TINY,
};

function Avatar({
  size = "medium",
  rotation = "normal",
  isDemo,
  src,
  defaultImage,
  // Handles both profile and listing avatars
  listing,
  profile,
  ...props
}) {
  const ImageComponent = isDemo ? StyledNextImage : StyledRemoteImage;
  const dimensions = SIZE_MAP[size];

  // Common props used across all cases
  const commonProps = {
    size,
    rotation,
    width: dimensions,
    height: dimensions,
    ...props,
  };

  // Direct profile avatar display (highest priority)
  if (profile) {
    return (
      <StyledRemoteImage
        bucket="avatars"
        filename={profile.avatar}
        defaultImage="profile.png"
        {...commonProps}
      />
    );
  }

  // Demo image handling
  if (isDemo) {
    return <StyledNextImage src={src} {...commonProps} />;
  }

  // Listing-based avatar logic
  if (listing) {
    // Determine default images based on listing type
    const computedDefaultImage =
      listing.type === "residential"
        ? "profile.png"
        : listing.type === "community"
          ? "community.png"
          : "business.png";

    return (
      <StyledRemoteImage
        bucket={listing.type === "residential" ? "avatars" : "listing_avatars"}
        filename={
          listing.type === "residential" ? listing.owner_avatar : listing.avatar
        }
        defaultImage={defaultImage || computedDefaultImage}
        {...commonProps}
      />
    );
  }

  // Default case - no profile or listing provided
  return (
    <StyledRemoteImage
      defaultImage={defaultImage || "profile.png"}
      {...commonProps}
    />
  );
}

export default Avatar;
