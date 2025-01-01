import { Fieldset as HeadlessFieldset } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledFieldset = styled(HeadlessFieldset)({
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

function TextArea({ children, ...props }) {
  return <StyledFieldset {...props}>{children}</StyledFieldset>;
}

export default TextArea;
