import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { PropsWithChildren } from "react";

// Often used for MD files like newsletter issues, privacy policy, colophon, etc
function LongformTextContainer({ children }: PropsWithChildren) {
  return <StyledLongformTextContent>{children}</StyledLongformTextContent>;
}

export default LongformTextContainer;

const StyledLongformTextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.text};
  margin: 4rem auto 0;
  background-color: ${theme.colors.background.top};
  padding: 2rem 1.25rem 3.5rem;
  border-radius: ${theme.corners.base};
  border: 1px solid ${theme.colors.border.base};
  & > hr {
    margin: 2rem 0;
    border-color: ${theme.colors.border.elevated};
    border-top-width: 1;
    border-bottom-width: 0;
  }
  & > h2,
  > h3,
  > h4,
  > h5,
  > h6 {
    line-height: ${theme.typography.lineHeight.h};
    font-weight: 500;
    color: ${theme.colors.text.brand.primary};
  }
  & > h2 {
    font-size: 1.5rem;
  }
  & > h3 {
    font-size: 1.25rem;
  }
  & > h4 {
    font-size: 1.1rem;
  }
  & > p,
  & li {
    font-size: ${theme.typography.size.p.md};
    color: ${theme.colors.text.secondary};
    line-height: ${theme.typography.lineHeight.p.md};
    & > strong {
      font-weight: 500;
    }
  }

  & p a,
  & li a {
    color: ${theme.colors.text.brand.primary};
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.14em;
    transition: ${theme.transitions.textColor};
  }

  & p a:visited,
  & li a:visited {
    color: ${theme.colors.text.brand.primary};
  }

  & p a:hover,
  & li a:hover {
    color: ${theme.colors.text.primary};
  }

  & p + p,
  & ul + p,
  & ol + p {
    margin-top: 1rem;
  }
  & p + h2,
  & ul + h2,
  & ol + h2 {
    margin-top: 2rem;
  }
  & p + h3,
  & ul + h3,
  & ol + h3 {
    margin-top: 1.5rem;
  }
  & p + h4,
  & ul + h4,
  & ol + h4 {
    margin-top: 1rem;
  }
  & ul,
  & ol {
    list-style-position: inside;
  }
  & ul {
    list-style-type: disc;
  }
  & ol {
    list-style-type: decimal;
  }
  & li + li {
    margin-top: 0.5rem;
  }
  @media (min-width: 768px) {
    & > h2 {
      font-size: 1.875rem;
    }
    & > h3 {
      font-size: 1.5rem;
    }
    & > h4 {
      font-size: 1.25rem;
    }
    & > p,
    & li {
      font-size: ${theme.typography.size.p.lg};
      line-height: ${theme.typography.lineHeight.p.lg};
    }
  }
`;
