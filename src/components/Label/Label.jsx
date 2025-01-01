import { Label as HeadlessLabel } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledLabel = styled(HeadlessLabel)({
  // color: "red",
});

export default function Label({ ...props }) {
  return <StyledLabel {...props} />;
}
