import RemoteImage from "@/components/RemoteImage";
import Image from "next/image";
import { styled } from "@pigment-css/react";

const SIZE_MASSIVE = 112;
const SIZE_LARGE = 88;
const SIZE_MEDIUM = 64;
const SIZE_SMALL = 40;

// Base styles that will be shared between both image types
const imageStyles = ({ theme }) => ({
  overflow: "hidden",
  objectFit: "cover",
  flexShrink: 0,
  background: theme.colors.background.pit,
  transform: `rotate(${theme.rotations.avatar})`,

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
        boxShadow: `0px 0px 0px 4px ${theme.colors.background.top}, 0px 0px 0px 5.5px ${theme.colors.border.base}, 3px 4px 0px 5px ${theme.colors.border.stark}`,
      },
    },
    {
      props: { size: "small" },
      style: {
        borderRadius: theme.corners.avatar.small,
        boxShadow: `0px 0px 0px 3px ${theme.colors.background.top}, 0px 0px 0px 4px ${theme.colors.border.base}, 2.5px 3px 0px 3px ${theme.colors.border.stark}`,
      },
    },
  ],
});

const StyledRemoteImage = styled(RemoteImage)(imageStyles);
const StyledNextImage = styled(Image)(imageStyles);

function Avatar({ size = "medium", isDemo, src, ...props }) {
  return isDemo ? (
    <StyledNextImage
      src={src}
      size={size}
      width={
        size === "massive"
          ? SIZE_MASSIVE
          : size === "large"
            ? SIZE_LARGE
            : size === "medium"
              ? SIZE_MEDIUM
              : SIZE_SMALL
      }
      height={
        size === "massive"
          ? SIZE_MASSIVE
          : size === "large"
            ? SIZE_LARGE
            : size === "medium"
              ? SIZE_MEDIUM
              : SIZE_SMALL
      }
      {...props}
    />
  ) : (
    <StyledRemoteImage
      size={size}
      width={
        size === "massive"
          ? SIZE_MASSIVE
          : size === "large"
            ? SIZE_LARGE
            : size === "medium"
              ? SIZE_MEDIUM
              : SIZE_SMALL
      }
      height={
        size === "massive"
          ? SIZE_MASSIVE
          : size === "large"
            ? SIZE_LARGE
            : size === "small"
              ? SIZE_SMALL
              : SIZE_MEDIUM
      }
      {...props}
    />
  );
}

export default Avatar;
