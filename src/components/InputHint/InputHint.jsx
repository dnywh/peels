import { Description as HeadlessDescription } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledInputHint = styled(HeadlessDescription)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: "normal",
  color: theme.colors.text.secondary,

  variants: [
    {
      props: { variant: "error" },
      style: {
        color: theme.colors.input.invalid.text,
      },
    },
  ],
}));

function InputHint({ variant, children }) {
  return (
    <StyledInputHint variant={variant ? variant : undefined}>
      {children}
    </StyledInputHint>
  );
}

export default InputHint;
