import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledLabel = styled(HeadlessLabel)({
  // color: "red",
});

export default function Label({ required = true, children, ...props }) {
  return (
    <StyledLabel {...props}>
      {children} {!required && <span>(optional)</span>}
    </StyledLabel>
  );
}
