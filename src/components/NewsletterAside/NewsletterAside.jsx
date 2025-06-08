import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import StrongLink from "@/components/StrongLink";
import { styled } from "@pigment-css/react";

// Analagous to EmailAside
// Used as an aside within a newsletter, explaining the context of the issue
// and providing information on how to opt-in (whether signed up already or not)
export default async function NewsletterAside() {
  const { isNewsletterSubscribed, isAuthenticated } =
    await useNewsletterStatus();

  return (
    <Aside>
      <h3>About this newsletter</h3>
      <p>
        {" "}
        This is the web version of the email newsletter sent out to subscribers.
        Feel free to share it far and wide.{" "}
        {!isAuthenticated ? (
          <>
            {" "}
            <StrongLink href="/sign-up">Join Peels</StrongLink> to receive
            future issues.
          </>
        ) : (
          !isNewsletterSubscribed && (
            <>
              {" "}
              <StrongLink href="/profile">Edit your preferences</StrongLink> to
              receive future issues.
            </>
          )
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
