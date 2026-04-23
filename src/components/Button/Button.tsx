import { Button as UnstyledButton } from "@headlessui/react";
import Link from "next/link";
import { css, styled } from "next-yak";
import { forwardRef, type ElementType, type ReactNode, type Ref } from "react";

import { resolveExternalRel } from "@/utils/linkRel";
import { theme } from "@/styles/theme.yak";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "send"
  | "subtle";
export type ButtonSize = "massive" | "large" | "normal" | "small" | "icon";
export type ButtonWidth = "contained" | "full";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: ButtonWidth;
  disabled?: boolean;
};

type StyledButtonStyleProps = {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $width?: ButtonWidth;
  $disabledState?: boolean;
};

type BaseButtonProps = ButtonStyleProps & {
  children?: ReactNode;
  loading?: boolean;
  loadingText?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

type DataAttributes = {
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

type SharedDomProps = React.AriaAttributes &
  DataAttributes & {
    autoFocus?: boolean;
    className?: string;
    id?: string;
    role?: React.AriaRole;
    style?: React.CSSProperties;
    tabIndex?: number;
    title?: string;
  };

type LinkNavigationProps = {
  href: string;
  locale?: string | false;
  onNavigate?: (event: { preventDefault: () => void }) => void;
  prefetch?: boolean | "auto" | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
};

export type ButtonElementProps = BaseButtonProps &
  SharedDomProps & {
    as?: ElementType;
    form?: string;
    formAction?: string | ((formData: FormData) => void | Promise<void>);
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    href?: undefined;
    name?: string;
    type?: "button" | "submit" | "reset";
    value?: string | number | readonly string[];
  };

export type LinkButtonProps = BaseButtonProps &
  SharedDomProps &
  LinkNavigationProps & {
    as?: never;
    download?: boolean | string;
    formAction?: never;
    formEncType?: never;
    formMethod?: never;
    formNoValidate?: never;
    formTarget?: never;
    name?: never;
    rel?: string;
    target?: React.HTMLAttributeAnchorTarget;
    type?: never;
    value?: never;
  };

export type ButtonProps = ButtonElementProps | LinkButtonProps;

type ButtonElementRestProps = Omit<
  ButtonElementProps,
  keyof BaseButtonProps | "href"
>;

type LinkButtonRestProps = Omit<
  LinkButtonProps,
  keyof BaseButtonProps | "href"
>;

const isLinkButton = (props: ButtonProps): props is LinkButtonProps =>
  props.href !== undefined;

const getCommonProps = (props: ButtonProps) => {
  const {
    variant = "secondary",
    disabled = false,
    children,
    tabIndex = 0,
    loading = false,
    loadingText = "Loading...",
    size = "normal",
    onClick,
    href,
    ...restProps
  } = props;

  return {
    variant,
    disabled,
    children,
    tabIndex,
    loading,
    loadingText,
    size,
    onClick,
    href,
    restProps,
  };
};

const getButtonElementProps = (props: ButtonElementRestProps) => {
  const { type = "button", ...buttonProps } = props;

  return {
    type,
    buttonProps,
  };
};

const getLinkButtonProps = (props: LinkButtonRestProps) => props;

const containedWidthStyles = css`
  align-self: flex-start;
`;

const fullWidthStyles = css`
  width: 100%;
`;

const massiveSizeStyles = css`
  height: 4rem;
  font-size: 1.3rem;
  border-radius: calc(${theme.corners.base} * 1.25);
  padding: 0 calc(${theme.spacing.unit} * 4);
`;

const largeSizeStyles = css`
  height: 3.5rem;
  font-size: 1.125rem;
`;

const normalSizeStyles = css`
  height: 3rem;
  font-size: 1.0625rem;
`;

const smallSizeStyles = css`
  height: 2.25rem;
  font-size: 0.875rem;
  padding: 0 calc(${theme.spacing.unit} * 1.5);
`;

const iconSizeStyles = css`
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 50%;
`;

const primaryVariantStyles = css`
  background: ${theme.colors.button.primary.background};
  color: ${theme.colors.button.primary.text};

  &:visited {
    color: ${theme.colors.button.primary.text};
  }

  &:not([disabled]):not([aria-disabled="true"]) {
    box-shadow: 0px 0px 0px 2px ${theme.colors.button.primary.background};
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    background: color-mix(
      in srgb,
      ${theme.colors.button.primary.background},
      ${theme.colors.button.primary.hover.tint}
        ${theme.colors.button.primary.hover.mix}
    );
    box-shadow: 0px 0px 0px 2px
      color-mix(
        in srgb,
        ${theme.colors.button.primary.background},
        ${theme.colors.button.primary.hover.tint}
          ${theme.colors.button.primary.hover.mix}
      );
  }
`;

const secondaryVariantStyles = css`
  background: ${theme.colors.button.secondary.background};
  color: ${theme.colors.button.secondary.text};
  box-shadow: 0px 0px 0px 2px ${theme.colors.border.base};

  &:visited {
    color: ${theme.colors.button.secondary.text};
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    color: color-mix(
      in srgb,
      ${theme.colors.button.secondary.text},
      ${theme.colors.button.secondary.hover.tint}
        ${theme.colors.button.secondary.hover.mix}
    );
  }
`;

const dangerVariantStyles = css`
  background: ${theme.colors.button.danger.background};
  color: ${theme.colors.button.danger.text};
  box-shadow: 0px 0px 0px 2px ${theme.colors.border.base};

  &:visited {
    color: ${theme.colors.button.danger.text};
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    color: color-mix(
      in srgb,
      ${theme.colors.button.danger.text},
      ${theme.colors.button.danger.hover.tint}
        ${theme.colors.button.danger.hover.mix}
    );
  }
`;

const sendVariantStyles = css`
  background-color: ${theme.colors.button.send.background};
  border: none;
  color: ${theme.colors.button.send.text};

  &:visited {
    color: ${theme.colors.button.send.text};
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: color-mix(
      in srgb,
      ${theme.colors.button.send.background},
      ${theme.colors.button.send.hover.tint}
        ${theme.colors.button.send.hover.mix}
    );
  }
`;

const subtleVariantStyles = css`
  background: ${theme.colors.button.secondary.background};
  color: ${theme.colors.button.secondary.text};
  border: 1px solid ${theme.colors.border.base};

  &:visited {
    color: ${theme.colors.button.secondary.text};
  }

  &:hover:not([disabled]):not([aria-disabled="true"]) {
    background-color: ${theme.colors.background.sunk};
  }
`;

const disabledVariantStyles = css`
  cursor: default;
  background: ${theme.colors.button.disabled.background};
  color: ${theme.colors.button.disabled.text};
  box-shadow: none;

  &:visited {
    color: ${theme.colors.button.disabled.text};
  }
`;

const sharedButtonStyles = css<StyledButtonStyleProps>`
  border: none;
  appearance: none;
  flex-shrink: 0;
  border-radius: ${theme.corners.base};
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 0 calc(${theme.spacing.unit} * 2);
  transform: translateY(0);
  transition:
    background 100ms ease-in-out,
    color 75ms ease-in-out,
    box-shadow 100ms ease-in-out,
    transform 50ms ease-out;

  & span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: inherit;
    line-height: inherit;
    padding-block: 0.08em;
  }

  & svg {
    color: inherit;
    flex-shrink: 0;
  }

  &:focus,
  &[data-focus] {
    outline: 3px solid ${theme.colors.focus.outline};
  }

  &[aria-disabled="true"] {
    cursor: default;
    background: ${theme.colors.button.disabled.background};
    color: ${theme.colors.button.disabled.text};
  }

  &:active:not([disabled]):not([aria-disabled="true"]) {
    transform: translateY(1px);
  }

  ${({ $width = "contained" }) =>
    $width === "full" ? fullWidthStyles : containedWidthStyles}

  ${({ $size = "normal" }) => {
    if ($size === "massive") return massiveSizeStyles;
    if ($size === "large") return largeSizeStyles;
    if ($size === "small") return smallSizeStyles;
    if ($size === "icon") return iconSizeStyles;
    return normalSizeStyles;
  }}

  ${({ $variant = "secondary" }) => {
    if ($variant === "primary") return primaryVariantStyles;
    if ($variant === "danger") return dangerVariantStyles;
    if ($variant === "send") return sendVariantStyles;
    if ($variant === "subtle") return subtleVariantStyles;
    return secondaryVariantStyles;
  }}

  ${({ $disabledState }) => $disabledState && disabledVariantStyles}
`;

const StyledButton = styled(UnstyledButton)<StyledButtonStyleProps>`
  ${sharedButtonStyles}
`;

const StyledLink = styled(Link)<StyledButtonStyleProps>`
  ${sharedButtonStyles}
`;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(allProps, ref) {
    const {
      variant,
      disabled,
      href,
      children,
      tabIndex,
      loading,
      loadingText,
      size,
      onClick,
      restProps,
    } = getCommonProps(allProps);
    const isLink = isLinkButton(allProps);
    const isLoading = loading && !isLink;
    const isDisabled = disabled || isLoading;
    const buttonContent = <span>{isLoading ? loadingText : children}</span>;
    const handleLinkClick: React.MouseEventHandler<HTMLElement> = (event) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    if (isLink) {
      const linkProps = getLinkButtonProps(restProps as LinkButtonRestProps);
      const rel = resolveExternalRel(linkProps.target, linkProps.rel);

      return (
        <StyledLink
          href={allProps.href}
          ref={ref as Ref<HTMLAnchorElement>}
          $variant={variant}
          $width={allProps.width}
          $size={size}
          $disabledState={isDisabled}
          tabIndex={isDisabled ? -1 : tabIndex}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          onClick={handleLinkClick}
          {...linkProps}
          rel={rel}
        >
          {buttonContent}
        </StyledLink>
      );
    }

    const { type, buttonProps } = getButtonElementProps(
      restProps as ButtonElementRestProps
    );

    return (
      <StyledButton
        type={type}
        ref={ref as Ref<HTMLButtonElement>}
        disabled={isDisabled}
        $variant={variant}
        $width={allProps.width}
        $size={size}
        $disabledState={isDisabled}
        tabIndex={isDisabled ? -1 : tabIndex}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        onClick={onClick}
        {...buttonProps}
      >
        {buttonContent}
      </StyledButton>
    );
  }
);

export default Button;
