"use client"; // For useNewsletterStatus

import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";

// Replaces EmailAside for the web version of newsletter issues
// Used as an aside within a newsletter, explaining the context of the issue
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterCallout which does a similar job, albeit outside of the newsletter bounds
export default function NewsletterAside() {
  const status = useNewsletterStatus();

  return (
    <Aside>
      <h3>About this newsletter</h3>
      <p>
        This is the web version of the email newsletter sent out to subscribers.{" "}
        {!status.isAuthenticated ? (
          <>
            <StrongLink href="/sign-up?newsletter_preference=true">
              Join Peels
            </StrongLink>{" "}
            to receive future issues.
          </>
        ) : status.isNewsletterSubscribed ? (
          "Feel free to share it far and wide."
        ) : (
          <>
            <StrongLink href="/profile">Edit your preferences</StrongLink> to
            receive future issues.
          </>
        )}
      </p>
    </Aside>
  );
}

const Aside = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  backgroundColor: theme.colors.background.sunk,
  padding: "2rem",
  margin: "2rem 0 0",
  borderRadius: theme.corners.base,

  "& h3, & p": {
    fontSize: theme.typography.size.p.md,
    "@media (min-width: 768px)": {
      fontSize: theme.typography.size.p.lg,
    },
  },

  "& h3": {
    color: theme.colors.text.ui.quinary,
    textTransform: "uppercase",
    fontWeight: 500,
    letterSpacing: "0.0875em",
    fontSize: "0.675rem",
  },
}));
