import StorageImage from "@/components/StorageImage";
import { styled } from "@pigment-css/react";

const StyledAvatar = styled(StorageImage)(({ theme }) => ({
  borderRadius: "0.5rem",
  width: "7rem",
  height: "7rem",
  overflow: "hidden",
  objectFit: "cover",
  flexShrink: 0,

  background: theme.colors.background.pit,
  boxShadow: `0px 0px 0px 4px ${theme.colors.background.top}, 0px 0px 0px 5.5px ${theme.colors.border.base}, 3px 4px 0px 5px ${theme.colors.border.stark}`,

  transform: "rotate(-3deg)",
}));

function Avatar({ ...props }) {
  return <StyledAvatar {...props} />;
}

export default Avatar;
