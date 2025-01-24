import RemoteImage from "@/components/RemoteImage";
import { styled } from "@pigment-css/react";

const LARGE_SIZE = 112;
const SMALL_SIZE = 32;

const StyledRemoteImage = styled(RemoteImage)(({ theme }) => ({
  overflow: "hidden",
  objectFit: "cover",
  flexShrink: 0,
  background: theme.colors.background.pit,
  transform: `rotate(${theme.rotations.avatar})`,

  variants: [
    {
      props: { size: "large" },
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
}));

function Avatar({ size = "large", ...props }) {
  return (
    <StyledRemoteImage
      // Pass size prop on to be styled
      size={size}
      // Need width and height to be passed to the RemoteImage component in pixel dimensions
      width={size === "large" ? LARGE_SIZE : SMALL_SIZE}
      height={size === "large" ? LARGE_SIZE : SMALL_SIZE}
      {...props}
    />
  );
}

export default Avatar;
