import IconWrapper from "../IconWrapper";
import { styled } from "@pigment-css/react";

// See ChevronRightIcon too, which was a fork of this (and more basic primitive)
// In fact, perhaps this should have a ChevronDownIcon embedded
const StyledIconWrapper = styled(IconWrapper, {
  shouldForwardProp: (prop) => prop !== "variant",
})(({ theme }) => ({
  pointerEvents: "none",
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  stroke: theme.colors.text.ui.tertiary,

  variants: [
    {
      props: { variant: "compact" },
      style: {
        right: "0.625rem",
      },
    },
  ],
}));

function DropdownIcon({ variant = "default" }) {
  return (
    <StyledIconWrapper
      variant={variant}
      size={variant === "compact" ? 18 : 20}
      strokeWidth={variant === "compact" ? 1.75 : 2}
    >
      <path d="m6 9 6 6 6-6" />
    </StyledIconWrapper>
  );
}

export default DropdownIcon;
