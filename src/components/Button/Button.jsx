import { Button as UnstyledButton } from "@headlessui/react";
import { styled } from "@pigment-css/react";

// inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white
const StyledButton = styled(UnstyledButton)(({ theme }) => ({
  // padding: "0.5rem 0.75rem",
  border: "none",
  // borderRadius: "0.375rem",
  borderRadius: theme.corners.unit * 0.5,
  fontSize: "1rem",
  // lineHeight: "1.25rem",
  minHeight: "2.75rem",
  // width: "100%", // TODO: Make this a prop (either take width of content or 100%)

  // background: theme.colors.primary,
  // color: theme.colors.secondary,
  "&:hover": {
    background: theme.colors.primary,
    color: theme.colors.secondary,
  },
  // These both work. Which is better then? I suppose whichever is still around once I remove Headless UI
  "&:focus": {
    background: theme.colors.primary,
    color: theme.colors.secondary,
    outline: "2px solid green",
  },
  "&[data-focus]": {
    outline: "2px solid blue",
  },
}));

export default function Button({ children, ...props }) {
  return (
    <StyledButton type="button" {...props}>
      {children}
    </StyledButton>
  );
}
