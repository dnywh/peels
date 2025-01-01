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
  "&[data-focus]": {
    outline: "2px solid blue",
  },
});

function Textarea({ children, ...props }) {
  return (
    <StyledTextarea
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
