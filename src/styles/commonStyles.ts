import { css } from "next-yak";
import { theme } from "@/styles/theme.yak";

export const sharedCenteredPageStackStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Common text block styling on static pages like the index and newsletter.
export const sharedSectionTextBlockStyles = css`
  ${sharedCenteredPageStackStyles}
  gap: ${theme.spacing.gap.sectionInner};

  & > * {
    text-align: center;
    text-wrap: balance;
  }
`;

export const sharedSurfaceStyles = css`
  background-color: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
`;

export const sharedSurfaceSectionStyles = css`
  ${sharedSurfaceStyles}
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 1.5)
    calc(${theme.spacing.unit} * 1.5);
`;

export const sharedInsetListStyles = css`
  display: flex;
  flex-direction: column;
  padding: 0 calc(${theme.spacing.unit} * 1.5) calc(${theme.spacing.unit} * 1.5);
`;

export const sharedSectionHeadingStyles = css`
  font-size: 1.5rem;
  font-weight: 600;
`;

// For use when anchor tags should visually inherit from the parent container.
export const sharedAnchorTagStyles = css`
  color: inherit;
  transition: ${theme.transitions.textColor};

  &:visited {
    color: inherit;
  }

  &:hover {
    color: ${theme.colors.text.primary};
  }
`;
