import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

type NewsletterImageFigcaptionProps = {
  margin?: boolean;
  children?: ReactNode;
};

export default function NewsletterImageFigcaption({
  margin = true,
  children,
}: NewsletterImageFigcaptionProps) {
  return <Figcaption $margin={margin}>{children}</Figcaption>;
}

const marginFalseStyles = css`
  margin: 0.25rem 0 0;
`;

const marginTrueStyles = css`
  margin: 0.75rem 0 0;
`;

const Figcaption = styled.figcaption<{ $margin?: boolean }>`
  font-size: ${theme.typography.size.p.sm};
  line-height: ${theme.typography.lineHeight.p.sm};
  text-align: center;
  color: ${theme.colors.text.tertiary};
  text-wrap: balance;

  ${({ $margin = true }) => ($margin ? marginTrueStyles : marginFalseStyles)}

  & a {
    color: ${theme.colors.text.brand.primary};
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.14em;
    transition: ${theme.transitions.textColor};
  }

  & a:visited {
    color: ${theme.colors.text.brand.primary};
  }

  & a:hover {
    color: ${theme.colors.text.primary};
  }
`;
