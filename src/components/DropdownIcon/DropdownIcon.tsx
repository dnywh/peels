import IconWrapper from "../IconWrapper";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

// See ChevronRightIcon too, which was a fork of this (and more basic primitive)
// In fact, perhaps this should have a ChevronDownIcon embedded
const compactVariantStyles = css`
  right: 0.625rem;
`;

type DropdownVariant = "default" | "compact";

const StyledIconWrapper = styled(IconWrapper)<{ $variant?: DropdownVariant }>`
  pointer-events: none;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  stroke: ${theme.colors.text.ui.tertiary};

  ${({ $variant }) => $variant === "compact" && compactVariantStyles}
`;

function DropdownIcon({ variant = "default" }: { variant?: DropdownVariant }) {
  return (
    <StyledIconWrapper
      $variant={variant}
      size={variant === "compact" ? "18" : "20"}
      strokeWidth={variant === "compact" ? 1.75 : 2}
    >
      <path d="m6 9 6 6 6-6" />
    </StyledIconWrapper>
  );
}

export default DropdownIcon;
