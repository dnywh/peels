import { Field as HeadlessField } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledField = styled(HeadlessField)({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

export default function Field({ children, ...props }) {
  return <StyledField {...props}>{children}</StyledField>;
}
