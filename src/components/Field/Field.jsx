import { Field as HeadlessField } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledField = styled(HeadlessField)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.forms.gap.field,
}));

export default function Field({ children, ...props }) {
  return <StyledField {...props}>{children}</StyledField>;
}
