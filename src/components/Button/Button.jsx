import { Button as UnstyledButton } from "@headlessui/react";
import { styled } from "@pigment-css/react";

// inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white
const StyledButton = styled(UnstyledButton)(({ theme }) => ({
  padding: "0.5rem 0.75rem",
  border: "none",
  borderRadius: "0.15rem",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  width: "100%",
  background: theme.colors.primary,
  color: theme.colors.secondary,
}));

export default function Button({ children, ...props }) {
  return <StyledButton {...props}>{children}</StyledButton>;
}
