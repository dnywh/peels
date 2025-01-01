import { Select as HeadlessSelect } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledSelect = styled(HeadlessSelect)({});

function Select({ children, ...props }) {
  return <StyledSelect {...props}>{children}</StyledSelect>;
}

export default Select;
