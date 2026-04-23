import { Select as HeadlessSelect } from "@headlessui/react";

import DropdownIcon from "@/components/DropdownIcon";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode, SelectHTMLAttributes } from "react";

const SilentContainer = styled.div`
  position: relative;
`;

const compactSelectStyles = css`
  font-size: 0.9375rem;
  min-height: 2.5rem;
  padding: 0.25rem 2rem 0.25rem 0.625rem;
`;

type SelectVariant = "default" | "compact";

const StyledSelect = styled(HeadlessSelect)<{ $variant?: SelectVariant }>`
  width: 100%;
  appearance: none;
  color: ${theme.colors.text.ui.primary};
  border: 1px solid ${theme.colors.border.stark};
  border-radius: calc(${theme.corners.base} * 0.5);
  background-color: ${theme.colors.background.slight};
  box-shadow: inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03);
  font-size: 1rem;
  min-height: 3.5rem;
  padding: 0.375rem 2.5rem 0.375rem 0.75rem;
  outline: none;

  &:focus,
  &[data-active] {
    outline: 3px solid ${theme.colors.focus.outline};
  }

  & * {
    color: black;
  }

  ${({ $variant }) => $variant === "compact" && compactSelectStyles}
`;

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children?: ReactNode;
  variant?: SelectVariant;
};

export default function Select({
  children,
  variant = "default",
  ...props
}: SelectProps) {
  return (
    <SilentContainer>
      <StyledSelect $variant={variant} {...props}>
        {children}
      </StyledSelect>
      <DropdownIcon variant={variant} />
    </SilentContainer>
  );
}
