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
import { styled } from "@pigment-css/react";

function StyledList({ children }) {
  return <UnorderedList>{children}</UnorderedList>;
}

export default StyledList;

const UnorderedList = styled("ul")(({ theme }) => ({
  margin: "auto",
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.media,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
}));
