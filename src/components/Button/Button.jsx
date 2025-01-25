import { Button as UnstyledButton } from "@headlessui/react";
import Link from "next/link";
import { styled } from "@pigment-css/react";

const buttonStyles = ({ theme }) => ({
  // Base styles that both button and link will share
  flexShrink: "0",
  border: "none",
  borderRadius: `calc(${theme.corners.base} * 1)`,
  color: theme.colors.button.secondary.text, // Default color needed for sub-button components like IconButton that don't specifiy a variant
  fontSize: "1rem",
  height: "3rem",
  cursor: "pointer",
  fontWeight: "600",
  display: "inline-flex", // Added to help with alignment
  alignItems: "center", // Added to help with alignment
  justifyContent: "center", // Added to help with alignment
  textDecoration: "none",
  // borderWidth: "2px",
  // borderColor: theme.colors.border.base,
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
        fontSize: "1.25rem",
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
      props: { size: "small" },
      style: {
        height: "2.5rem",
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
  variant,
  disabled = false,
  href,
  children,
  tabIndex = 0,
  // size,
  ...props
}) {
  const sharedProps = {
    disabled,
    variant,
    tabIndex,
    // size,
    ...props,
  };

  // Render either a button or a link based on the presence of href
  return href ? (
    <StyledLink href={href} {...sharedProps}>
      <span>{children}</span>
    </StyledLink>
  ) : (
    <StyledButton type="button" {...sharedProps}>
      <span>{children}</span>
    </StyledButton>
  );
}
