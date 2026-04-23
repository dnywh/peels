import { theme } from "@/styles/theme.yak";
/**
 * A shared styled unordered list wrapper kept in its own file so newsletter
 * pages and other server-safe routes can reuse the same layout without
 * repeating the styling inline at each call site.
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
