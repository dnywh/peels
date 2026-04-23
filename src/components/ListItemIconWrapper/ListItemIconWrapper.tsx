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
  return (
    <StyledListItemIconWrapper
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 21"
      fill={fill}
      aria-hidden="true"
      aria-label={label}
      role="img"
      $tone={type}
      {...props}
    >
      {children}
    </StyledListItemIconWrapper>
  );
}

export default ListItemIconWrapper;
