import { Button as UnstyledButton } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledButton = styled(UnstyledButton)(({ theme }) => ({
  // "rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700",
  border: "none",
  borderRadius: theme.corners.unit * 0.5,
  fontSize: "1rem",
  // minHeight: "2.75rem",
  // maxHeight: "2.75rem",
  height: "2.75rem",
  cursor: "pointer",
  // background: theme.colors.button.primary.background,
  // color: theme.colors.button.primary.text,
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: theme.colors.border.base,
  borderRadius: theme.corners.base,

  padding: `0 ${theme.spacing.unit * 2}px`,

  variants: [
    {
      props: { width: "contained" },
      style: {
        alignSelf: "flex-start",
      },
    },
    {
      props: { variant: "primary" },
      style: {
        background: theme.colors.button.primary.background,
        color: theme.colors.button.primary.text,
        border: "none",
      },
    },
    {
      props: { variant: "secondary" },
      style: {
        background: theme.colors.button.secondary.background,
        color: theme.colors.button.secondary.text,
        borderColor: theme.colors.border.base,
      },
    },
    {
      props: { variant: "danger" },
      style: {
        background: theme.colors.button.danger.background,
        color: theme.colors.button.danger.text,
        borderColor: theme.colors.border.base,
      },
    },
    {
      props: { disabled: true },
      style: {
        background: theme.colors.button.disabled.background,
        color: theme.colors.button.disabled.text,
      },
    },
  ],

  "&:hover": {
    background: theme.colors.tab.active,
    color: theme.colors.text.primary,
  },
  "&:focus": {
    background: theme.colors.tab.active,
    color: theme.colors.text.primary,
    outline: "2px solid green",
  },
  "&[data-focus]": {
    outline: "2px solid blue",
  },
}));

export default function Button({
  variant = "primary",
  disabled = false,
  children,
  ...props
}) {
  return (
    <StyledButton
      disabled={disabled}
      variant={variant}
      type="button"
      {...props}
    >
      {children}
    </StyledButton>
  );
}
