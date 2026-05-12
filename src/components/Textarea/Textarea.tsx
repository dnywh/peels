import { Textarea as HeadlessTextarea } from "@headlessui/react";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode, TextareaHTMLAttributes } from "react";

const chatTextareaStyles = css`
  max-height: min(7rem, 24dvh);
  min-height: 3rem;
  overflow-y: auto;
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
  resize: none;
`;

const verticalResizeStyles = css`
  resize: vertical;
`;

type TextareaVariant = "default" | "chat";
type TextareaResize = "none" | "vertical";

const StyledTextarea = styled(HeadlessTextarea)<{
  $variant?: TextareaVariant;
  $resize?: TextareaResize;
}>`
  flex: 1;
  border: 1px solid ${theme.colors.border.stark};
  border-radius: calc(${theme.corners.base} * 0.5);
  background-color: ${theme.colors.background.slight};
  box-shadow: inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03);
  font-size: 1rem;
  min-height: 3.5rem;
  padding: 0.9rem 0.75rem;
  resize: none;
  field-sizing: content;
  form-sizing: content;

  &::placeholder {
    color: ${theme.colors.input.placeholder.text};
  }

  &:focus,
  &[data-focus] {
    outline: 2px solid ${theme.colors.border.focus};
    outline-offset: 2px;
  }

  ${({ $variant }) => $variant === "chat" && chatTextareaStyles}
  ${({ $resize }) => $resize === "vertical" && verticalResizeStyles}
`;

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  children?: ReactNode;
  resize?: TextareaResize;
  variant?: TextareaVariant;
};

function Textarea({
  resize,
  variant = "default",
  children,
  ...props
}: TextareaProps) {
  return (
    <StyledTextarea
      $resize={resize}
      $variant={variant}
      autoCorrect="on"
      spellCheck
      autoCapitalize="sentences"
      {...props}
    >
      {children}
    </StyledTextarea>
  );
}

export default Textarea;
