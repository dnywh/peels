import { Button as UnstyledButton } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledButton = styled(UnstyledButton)(({ theme }) => ({
  // "rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700",
  border: "none",
  borderRadius: theme.corners.unit * 0.5,
  fontSize: "1rem",
  minHeight: "2.75rem",
  cursor: "pointer",
  "&:hover": {
    background: theme.colors.primary,
    color: theme.colors.secondary,
  },
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
