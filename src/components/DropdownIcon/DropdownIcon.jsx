import IconWrapper from "../IconWrapper";

import { styled } from "@pigment-css/react";

const StyledIconWrapper = styled(IconWrapper)(({ theme }) => ({
  pointerEvents: "none",
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  stroke: theme.colors.text.ui.tertiary,
}));

function DropdownIcon() {
  return (
    <StyledIconWrapper size={20} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </StyledIconWrapper>
  );
}

export default DropdownIcon;
