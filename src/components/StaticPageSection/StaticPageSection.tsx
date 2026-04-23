import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { HTMLAttributes, ReactNode } from "react";

interface StaticPageSectionProps extends HTMLAttributes<HTMLElement> {
  padding?: "md" | "lg" | null;
  children?: ReactNode;
}

function StaticPageSection({
  padding = "md",
  children,
  ...props
}: StaticPageSectionProps) {
  return (
    <Section $padding={padding ?? ""} {...props}>
      {children}
    </Section>
  );
}

export default StaticPageSection;

const mediumPaddingStyles = css`
  padding-top: ${theme.spacing.gap.page.md};
  border-top: 1px solid ${theme.colors.border.light};
`;

const largePaddingStyles = css`
  gap: ${theme.spacing.gap.section.lg};
  padding-top: ${theme.spacing.gap.page.md};
  border-top: 1px solid ${theme.colors.border.light};

  @media (min-width: 768px) {
    padding-top: ${theme.spacing.gap.page.lg};
  }
`;

const Section = styled.section<{ $padding?: "md" | "lg" | "" | null }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.gap.section.md};
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};

  ${({ $padding = "md" }) => {
    if ($padding === "lg") return largePaddingStyles;
    if ($padding === "md") return mediumPaddingStyles;
    return "";
  }}
`;
