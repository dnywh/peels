import { css } from "next-yak";
import { theme } from "@/styles/theme.yak";

// Common text block styling on static pages like the index and newsletter.
export const sharedSectionTextBlockStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.gap.sectionInner};

  & > * {
    text-align: center;
    text-wrap: balance;
  }
`;

// For use when anchor tags should visually inherit from the parent container.
export const sharedAnchorTagStyles = css`
  color: inherit;
  transition: ${theme.transitions.textColor};

  &:hover {
    color: ${theme.colors.text.primary};
  }
`;
