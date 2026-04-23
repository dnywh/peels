import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { sharedCenteredPageStackStyles } from "@/styles/commonStyles";
import type { ReactNode } from "react";

type StaticPageMainProps = {
  padding?: "wide" | null;
  children?: ReactNode;
};

function StaticPageMain({ padding = null, children }: StaticPageMainProps) {
  return <StyledMain $padding={padding}>{children}</StyledMain>;
}

export default StaticPageMain;

// Adapted from homepage main
const widePaddingStyles = css`
  padding-top: ${theme.spacing.gap.page.md};

  @media (min-width: 768px) {
    padding-top: ${theme.spacing.gap.page.lg};
  }
`;

const StyledMain = styled.main<{ $padding?: "wide" | null }>`
  ${sharedCenteredPageStackStyles};
  gap: ${theme.spacing.gap.page.md};

  @media (min-width: 768px) {
    gap: ${theme.spacing.gap.page.md};
  }

  ${({ $padding }) => $padding === "wide" && widePaddingStyles}
`;
