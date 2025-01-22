import { Select as HeadlessSelect } from "@headlessui/react";

import DropdownIcon from "@/components/DropdownIcon";
import { styled } from "@pigment-css/react";

const SilentContainer = styled("div")(({ theme }) => ({
  position: "relative",
}));

const StyledSelect = styled(HeadlessSelect)(({ theme }) => ({
  width: "100%",
  appearance: "none", // Reset browser-specific styles
  color: theme.colors.text.ui.primary,

  // 'mt-3 block w-full appearance-none rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white',
  // 'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25',

  // TODO: Share programmatically with the other input components like Textarea, Input,
  color: theme.colors.text.ui.primary,
  border: `1px solid ${theme.colors.border.stark}`,
  borderRadius: `calc(${theme.corners.base} * 0.5)`,
  backgroundColor: theme.colors.background.slight,
  boxShadow: `inset 0 -3px 2px 0 rgba(0, 0, 0, 0.03)`,

  fontSize: "1rem",
  minHeight: "3.5rem",
  padding: "0.375rem 0.75rem",

  outline: "none", // Reset browser-specific outline
  "&:focus, &[data-active]": {
    outline: `3px solid ${theme.colors.focus.outline}`,
  },

  "& *": {
    color: "black", // Apparently needed for Windows? See code example in https://headlessui.com/react/select
  },
}));

export default function Select({ children, ...props }) {
  return (
    <SilentContainer>
      <StyledSelect {...props}>{children}</StyledSelect>
      <DropdownIcon />
    </SilentContainer>
  );
}
