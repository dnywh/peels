import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledLabel = styled(HeadlessLabel)(({ theme }) => ({
  color: theme.colors.text.ui.primary,
  fontWeight: "600",

  "& span": {
    fontWeight: "400",
    color: theme.colors.text.ui.secondary,
  },
}));

export default function Label({ required = true, children, ...props }) {
  return (
    <StyledLabel {...props}>
      {children} {!required && <span>(optional)</span>}
    </StyledLabel>
  );
}
