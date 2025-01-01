import { Description as HeadlessDescription } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledDescription = styled(HeadlessDescription)({});

export default function Description({ children, ...props }) {
  return (
    <StyledDescription {...props}>
      <small>{children}</small>
    </StyledDescription>
  );
}
