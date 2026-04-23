import { Input as HeadlessInput } from "@headlessui/react";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const StyledInput = styled(HeadlessInput)`
  color: ${theme.colors.text.ui.secondary};
  border: 1px solid ${theme.colors.border.stark};
  border-radius: calc(${theme.corners.base} * 0.5);
  background-color: ${theme.colors.background.slight};
  box-shadow: inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03);
  font-size: 1rem;
  min-height: 3.5rem;
  padding: 0.375rem 0.75rem;
  &::placeholder {
    color: ${theme.colors.input.placeholder.text};
  }
  &:focus {
    outline: none;
    outline-width: 20px;
    outline-offset: 2px;
    outline-color: ${theme.colors.border.focus};
  }
  &[data-invalid] {
    border-color: ${theme.colors.input.invalid.border};
    border-width: 2px;
  }
  &[disabled] {
    color: ${theme.colors.input.disabled.text};
    cursor: not-allowed;
    user-select: none;
  }
`;

export default function Input({ error = null, ...props }) {
  return <StyledInput invalid={error ? true : undefined} {...props} />;
}
