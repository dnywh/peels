import { Input as HeadlessInput } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledInput = styled(HeadlessInput)(({ theme }) => ({
  // TODO: Share programmatically with the other input components like Textarea, Select
  color: theme.colors.text.ui.secondary,
  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.5)`,
  backgroundColor: theme.colors.background.slight,
  boxShadow: `inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03)`,

  fontSize: "1rem",
  minHeight: "3.5rem",
  padding: "0.375rem 0.75rem",

  "&:focus-active": {
    outline: "none",
    outlineWidth: "20px",
    outlineOffset: "2px",
    outlineColor: theme.colors.border.focus,
  },

  "&[data-invalid]": {
    borderColor: theme.colors.input.invalid.border,
    borderWidth: "2px",
  },

  "&[disabled]": {
    color: theme.colors.input.disabled.text,
    cursor: "not-allowed",
  },
}));

export default function Input({ error = null, ...props }) {
  return <StyledInput invalid={error ? true : undefined} {...props} />;
}
