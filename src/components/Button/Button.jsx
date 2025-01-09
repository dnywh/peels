import { Button as UnstyledButton } from "@headlessui/react";
import { styled } from "@pigment-css/react";

const StyledButton = styled(UnstyledButton)(({ theme }) => ({
  // "rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700",
  border: "none",
  borderRadius: theme.corners.unit * 0.5,
  fontSize: "1rem",
  // minHeight: "2.75rem",
  // maxHeight: "2.75rem",
  height: "3rem",
  cursor: "pointer",
  fontWeight: "600",
  // background: theme.colors.button.primary.background,
  // color: theme.colors.button.primary.text,
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: theme.colors.border.base,
  borderRadius: theme.corners.base,

  padding: `0 ${theme.spacing.unit * 2}px`,

  transition: "background 150ms ease-in-out",

  "&:focus": {
    outline: `3px solid ${theme.colors.focus.outline}`,
  },
  "&[data-focus]": {
    outline: `3px solid ${theme.colors.focus.outline}`,
  },

  variants: [
    {
      props: { width: "contained" },
      style: {
        alignSelf: "flex-start",
      },
    },
    {
      props: { width: "full" },
      style: {
        width: "100%",
      },
    },
    {
      props: { size: "large" },
      style: {
        height: "3.5rem",
        fontSize: "1.125rem",
      },
    },
    {
      props: { size: "small" },
      style: {
        height: "2.5rem",
        fontSize: "1rem",
        padding: `0 ${theme.spacing.unit * 1.5}px`,
      },
    },
    {
      props: { variant: "primary" },
      style: {
        background: theme.colors.button.primary.background,
        color: theme.colors.button.primary.text,
        border: "none",
        "&:hover": {
          background: `color-mix(in srgb, ${theme.colors.button.primary.background}, ${theme.colors.button.primary.hover.tint} ${theme.colors.button.primary.hover.mix})`,
        },
      },
    },
    {
      props: { variant: "secondary" },
      style: {
        background: theme.colors.button.secondary.background,
        color: theme.colors.button.secondary.text,
        borderColor: theme.colors.border.base,
        "&:hover": {
          background: `color-mix(in srgb, ${theme.colors.button.secondary.background}, ${theme.colors.button.secondary.hover.tint} ${theme.colors.button.secondary.hover.mix})`,
        },
      },
    },
    {
      props: { variant: "danger" },
      style: {
        background: theme.colors.button.danger.background,
        color: theme.colors.button.danger.text,
        borderColor: theme.colors.border.base,
        "&:hover": {
          background: `color-mix(in srgb, ${theme.colors.button.danger.background}, ${theme.colors.button.danger.hover.tint} ${theme.colors.button.danger.hover.mix})`,
        },
      },
    },
    {
      props: { disabled: true },
      style: {
        background: theme.colors.button.disabled.background,
        color: theme.colors.button.disabled.text,
        "&:hover": {
          background: `color-mix(in srgb, ${theme.colors.button.disabled.background}, ${theme.colors.button.disabled.hover.tint} ${theme.colors.button.disabled.hover.mix})`,
        },
      },
    },
  ],
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
