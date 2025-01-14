import { Textarea as HeadlessTextarea } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledTextarea = styled(HeadlessTextarea)({
  flex: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  justifyContent: "stretch",
  gap: "1rem",
  resize: "none",
  fieldSizing: "content", // https://chriscoyier.net/2023/09/29/css-solves-auto-expanding-textareas-probably-eventually/
  formSizing: "content",
  "&[data-focus]": {
    outline: "2px solid blue",
  },
  variants: [
    {
      props: { resize: "vertical" },
      style: {
        resize: "vertical",
      },
    },
  ],
});

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
