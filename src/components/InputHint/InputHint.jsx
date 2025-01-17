import { Description as HeadlessDescription } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledInputHint = styled(HeadlessDescription)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: "normal",
  color: theme.colors.text.secondary,
}));

function InputHint({ children }) {
  return <StyledInputHint>{children}</StyledInputHint>;
}

export default InputHint;
