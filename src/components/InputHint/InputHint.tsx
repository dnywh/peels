import { Description as HeadlessDescription } from "@headlessui/react";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { HTMLAttributes, ReactNode } from "react";

const errorHintStyles = css`
  color: ${theme.colors.input.invalid.text};
`;

const centredHintStyles = css`
  text-align: center;
  text-wrap: balance;
`;

type InputHintVariant = "default" | "error" | "centered" | "success";

const StyledInputHint = styled(HeadlessDescription)<{
  $variant?: InputHintVariant;
}>`
  font-size: 0.875rem;
  font-weight: normal;
  color: ${theme.colors.text.ui.secondary};
  line-height: 130%;

  ${({ $variant }) => $variant === "error" && errorHintStyles}
  ${({ $variant }) => $variant === "centered" && centredHintStyles}
`;

type InputHintProps = HTMLAttributes<HTMLElement> & {
  variant?: InputHintVariant;
  children?: ReactNode;
};

function InputHint({ variant, children, ...props }: InputHintProps) {
  return (
    <StyledInputHint $variant={variant ? variant : undefined} {...props}>
      {children}
    </StyledInputHint>
  );
}

export default InputHint;
