import { theme } from "@/styles/theme.yak";
/**
 * A styled unordered list component that exists as a separate file to avoid
 * server/client component boundary issues with Pigment CSS in Next.js.
 *
 * This separation is necessary because Pigment CSS's styled components
 * can cause issues when defined directly within server components that
 * use Node.js APIs (like fs). By isolating the styled component in its
 * own file, we maintain a clean boundary between server-side data fetching
 * and client-side styling concerns.
 *
 * @see NewsletterIssuesList.jsx for the primary usage
 */
import { styled } from "next-yak";
import type { PropsWithChildren } from "react";

function StyledList({ children }: PropsWithChildren) {
  return <UnorderedList>{children}</UnorderedList>;
}

export default StyledList;

const UnorderedList = styled.ul`
  margin: auto;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.gap.section.md};
  & section {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.gap.sectionInner};
    & h2 {
      color: ${theme.colors.text.ui.emptyState};
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.0875em;
      margin-left: 2rem;
    }
  }
`;
