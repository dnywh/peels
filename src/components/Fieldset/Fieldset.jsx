import { Fieldset as HeadlessFieldset } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledFieldset = styled(HeadlessFieldset)({});

function Fieldset({ children, ...props }) {
  return <StyledFieldset {...props}>{children}</StyledFieldset>;
}

export default Fieldset;
