"use client";

import { useRouter } from "next/navigation";
import Button, { type ButtonProps } from "@/components/Button";
import {
  X,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  EllipsisVertical,
} from "lucide-react";

import { css, styled } from "next-yak";
import { forwardRef, type ComponentType } from "react";

type IconButtonIcon =
  | "back"
  | "close"
  | "maximize"
  | "minimize"
  | "overflow"
  | "send";
type IconButtonBreakpoint = "sm";

type StyledButtonProps = {
  breakpoint?: IconButtonBreakpoint;
};

export type IconButtonProps = Omit<
  ButtonProps,
  "children" | "size" | "loadingText"
> &
  StyledButtonProps & {
    icon?: IconButtonIcon;
    loading?: boolean;
    loadingLabel?: string;
  };

const smallBreakpointStyles = css`
  display: flex;

  @media (min-width: 768px) {
    display: none;
  }
`;

const StyledButton = styled(Button)<{ $breakpoint?: IconButtonBreakpoint }>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $breakpoint }) => $breakpoint === "sm" && smallBreakpointStyles}
`;

const StyledButtonComponent = StyledButton as ComponentType<any>;

const iconLabels: Record<IconButtonIcon, string> = {
  back: "Go back",
  close: "Close",
  maximize: "Expand",
  minimize: "Collapse",
  overflow: "More options",
  send: "Send",
};

function SpinnerIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>
        <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}

const IconButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  IconButtonProps
>(function IconButton(
  {
    onClick,
    variant = "subtle",
    icon = "back",
    breakpoint,
    loading = false,
    loadingLabel,
    "aria-label": ariaLabel,
    disabled = false,
    ...props
  },
  ref
) {
  const router = useRouter();
  const accessibleLabel = loading
    ? loadingLabel || ariaLabel || "Loading"
    : ariaLabel || iconLabels[icon];

  const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      onClick(e);
    }

    if (!onClick && icon === "back") {
      router.back();
    }
  };

  return (
    <StyledButtonComponent
      ref={ref}
      size="icon"
      variant={variant}
      $breakpoint={breakpoint}
      onClick={handleClick}
      aria-label={accessibleLabel}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <SpinnerIcon />
      ) : (
        <>
          {icon === "close" && <X size={16} aria-hidden="true" />}
          {icon === "back" && <ArrowLeft size={16} aria-hidden="true" />}
          {icon === "maximize" || icon === "send" ? (
            <ArrowUp size={16} aria-hidden="true" />
          ) : null}
          {icon === "minimize" && <ArrowDown size={16} aria-hidden="true" />}
          {icon === "overflow" && (
            <EllipsisVertical size={16} aria-hidden="true" />
          )}
        </>
      )}
    </StyledButtonComponent>
  );
});

export default IconButton;
