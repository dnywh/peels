import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode, SVGProps } from "react";

const acceptedStyles = css`
  stroke: ${theme.colors.status.accepted};
`;

const rejectedStyles = css`
  stroke: ${theme.colors.status.rejected};
`;

type ListItemTone = "accepted" | "rejected";

const StyledListItemIconWrapper = styled.svg<{ $tone?: ListItemTone }>`
  flex-shrink: 0;

  ${({ $tone = "accepted" }) =>
    $tone === "rejected" ? rejectedStyles : acceptedStyles}
`;

function ListItemIconWrapper({
  children,
  size = "20",
  label = "",
  fill = "none",
  type = "accepted",
  ...props
}: SVGProps<SVGSVGElement> & {
  children?: ReactNode;
  size?: number | string;
  label?: string;
  type?: ListItemTone;
}) {
  const accessibleLabel = label || props["aria-label"];

  return (
    <StyledListItemIconWrapper
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 21"
      fill={fill}
      aria-hidden={accessibleLabel ? undefined : true}
      aria-label={accessibleLabel || undefined}
      role="img"
      $tone={type}
      {...props}
    >
      {accessibleLabel && <title>{accessibleLabel}</title>}
      {children}
    </StyledListItemIconWrapper>
  );
}

export default ListItemIconWrapper;
