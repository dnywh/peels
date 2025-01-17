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
    <StyledIconWrapper size={20}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </StyledIconWrapper>
  );
}

export default DropdownIcon;
