import { Button as UnstyledButton } from "@headlessui/react";
import Link from "next/link";
import { styled } from "@pigment-css/react";

const buttonStyles = ({ theme }) => ({
  // Resets
  border: "none",
  appearance: "none",
  // Base styles that both button and link will share
  flexShrink: 0,
  borderRadius: `calc(${theme.corners.base} * 1)`,
  cursor: "pointer",
  fontWeight: "500",
  display: "inline-flex", // Added to help with alignment
  alignItems: "center", // Added to help with alignment
  justifyContent: "center", // Added to help with alignment
  textDecoration: "none",
  padding: `0 calc(${theme.spacing.unit} * 2)`,
  transition:
    "background 100ms ease-in-out, color 75ms ease-in-out, box-shadow 100ms ease-in-out",

  // Ellipsize text
  "& span": {
    display: "inline-block",
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },

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
      props: { size: "massive" },
      style: {
        height: "4rem",
        fontSize: "1.3rem",
        borderRadius: `calc(${theme.corners.base} * 1.25)`,
        padding: `0 calc(${theme.spacing.unit} * 4)`,
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
      props: { size: "normal" },
      style: {
        height: "3rem",
        fontSize: "1.0625rem", // 17px
      },
    },
    {
      props: { size: "small" },
      style: {
        height: "2.25rem",
        fontSize: "0.875rem",
        padding: `0 calc(${theme.spacing.unit} * 1.5)`,
      },
    },
    {
      props: { variant: "primary" },
      style: {
        background: theme.colors.button.primary.background,
        color: theme.colors.button.primary.text,

        "&:not([disabled])": {
          boxShadow: `0px 0px 0px 2px ${theme.colors.button.primary.background}`, // Match visual height of sibling buttons with box-shadow
        },
        "&:hover&:not([disabled])": {
          background: `color-mix(in srgb, ${theme.colors.button.primary.background}, ${theme.colors.button.primary.hover.tint} ${theme.colors.button.primary.hover.mix})`,
          boxShadow: `0px 0px 0px 2px color-mix(in srgb, ${theme.colors.button.primary.background}, ${theme.colors.button.primary.hover.tint} ${theme.colors.button.primary.hover.mix})`,
        },
      },
    },
    {
      props: { variant: "secondary" },
      style: {
        background: theme.colors.button.secondary.background,
        color: theme.colors.button.secondary.text,
        // borderColor: theme.colors.border.base,
        boxShadow: `0px 0px 0px 2px ${theme.colors.border.base}`,
        "&:hover&:not([disabled])": {
          color: `color-mix(in srgb, ${theme.colors.button.secondary.text}, ${theme.colors.button.secondary.hover.tint} ${theme.colors.button.secondary.hover.mix})`,
        },
      },
    },
    {
      props: { variant: "danger" },
      style: {
        background: theme.colors.button.danger.background,
        color: theme.colors.button.danger.text,
        // borderColor: theme.colors.border.base,
        boxShadow: `0px 0px 0px 2px ${theme.colors.border.base}`,
        "&:hover&:not([disabled])": {
          color: `color-mix(in srgb, ${theme.colors.button.danger.text}, ${theme.colors.button.danger.hover.tint} ${theme.colors.button.danger.hover.mix})`,
        },
      },
    },
    {
      props: { variant: "send" },
      style: {
        backgroundColor: theme.colors.button.send.background,
        border: "none",
        color: theme.colors.button.send.text,

        "&:hover&:not([disabled])": {
          backgroundColor: `color-mix(in srgb, ${theme.colors.button.send.text}, ${theme.colors.button.send.hover.tint} ${theme.colors.button.send.hover.mix})`,
        },
      },
    },
    {
      // The default style for IconButton
      props: { variant: "subtle" },
      style: {
        // Assume styles from secondary, mainly so I don't have to put visual styles in size: "icon" (TODO: avoid repetition)
        background: theme.colors.button.secondary.background,
        color: theme.colors.button.secondary.text,
        border: `1px solid ${theme.colors.border.base}`,
        "&:hover&:not([disabled])": {
          backgroundColor: theme.colors.background.sunk,
        },
      },
    },
    {
      props: { size: "icon" },
      style: {
        width: "2rem",
        height: "2rem",
        padding: 0,
        borderRadius: "50%",
      },
    },
    {
      props: { disabled: true },
      style: {
        cursor: "default",
        background: theme.colors.button.disabled.background,
        color: theme.colors.button.disabled.text,
      },
    },
  ],
});

const StyledButton = styled(UnstyledButton)(buttonStyles);
const StyledLink = styled(Link)(buttonStyles);

export default function Button({
  variant = "secondary",
  disabled = false,
  href,
  children,
  tabIndex = 0,
  loading = false,
  loadingText = "Loading...",
  type = "button",
  size = "normal",
  ...props
}) {
  const isDisabled = disabled || loading;

  const sharedProps = {
    disabled: isDisabled,
    variant,
    tabIndex: isDisabled ? -1 : tabIndex,
    "aria-disabled": isDisabled,
    size,
    ...props,
  };

  const buttonContent = <span>{loading ? loadingText : children}</span>;

  // Render either a button or a link based on the presence of href
  return href ? (
    <StyledLink href={href} {...sharedProps}>
      {buttonContent}
    </StyledLink>
  ) : (
    <StyledButton type={type} {...sharedProps}>
      {buttonContent}
    </StyledButton>
  );
}
