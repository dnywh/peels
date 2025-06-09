// import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";

// Reaplces EmailAside for the web version of newsletter issues
// Used as an aside within a newsletter, explaining the context of the issue
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterCallout which does a similar job, albeit outside of the newsletter bounds
export default async function NewsletterAside() {
  // const { isNewsletterSubscribed, isAuthenticated } =
  //   await useNewsletterStatus();

  const isAuthenticated = false; // TODO: Temporary

  return (
    <Aside>
      <h3>About this newsletter</h3>
      <p>
        This is the web version of the email newsletter sent out to subscribers.{" "}
        {!isAuthenticated ? (
          <>
            <StrongLink href="/sign-up">Join Peels</StrongLink> to receive
            future issues.
          </>
        ) : isNewsletterSubscribed ? (
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
  backgroundColor: theme.colors.background.sunk,
  padding: "2rem",
  borderRadius: theme.corners.base,
}));
