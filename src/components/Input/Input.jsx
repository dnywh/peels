import { Input as HeadlessInput } from "@headlessui/react";
import { styled } from "@pigment-css/react";

// mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
//'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25

const StyledInput = styled(HeadlessInput)({
  marginTop: "0.5rem",
  // width: "100%",
  padding: "0.375rem 0.75rem",
  // borderRadius: "0.15rem",
  // borderRadius: theme.corners.unit * 0.5,
  borderRadius: "0.25rem",
  // background: "white",
  border: "1px solid lightgrey",
  fontSize: "0.875rem",
  minHeight: "1.75rem",

  "&:focus-active": {
    outline: "none",
    outlineWidth: "20px",
    outlineOffset: "2px",
    outlineColor: "red",
  },
});

export default function Input({ ...props }) {
  return <StyledInput {...props} />;
}
