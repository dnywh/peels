import { RadioGroup as HeadlessRadioGroup } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledRadioGroup = styled(HeadlessRadioGroup)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
}));

function RadioGroup({ children, ...props }) {
  return <StyledRadioGroup {...props}>{children}</StyledRadioGroup>;
}

export default RadioGroup;
