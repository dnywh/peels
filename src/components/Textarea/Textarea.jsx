import { Textarea as HeadlessTextarea } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledTextarea = styled(HeadlessTextarea)(({ theme }) => ({
  flex: 1, // Take full width of parent
  // TODO: Share programmatically with the other input components like Textarea
  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.5)`,
  backgroundColor: theme.colors.background.slight,
  boxShadow: `inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03)`,

  fontSize: "1rem",
  minHeight: "3.5rem",
  padding: "0.9rem 0.75rem", // Different to Input

  "&:focus-active": {
    outline: "none",
    outlineWidth: "20px",
    outlineOffset: "2px",
    outlineColor: theme.colors.border.focus,
  },

  resize: "none",
  fieldSizing: "content", // https://chriscoyier.net/2023/09/29/css-solves-auto-expanding-textareas-probably-eventually/
  formSizing: "content",
  variants: [
    {
      props: { resize: "vertical" },
      style: {
        resize: "vertical",
      },
    },
  ],
}));

function Textarea({ resize, children, ...props }) {
  return (
    <StyledTextarea
      resize={resize}
      autoCorrect="on"
      spellCheck="true"
      autoCapitalize="sentences"
      {...props}
    >
      {children}
    </StyledTextarea>
  );
}

export default Textarea;
