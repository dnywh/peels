import Button from "@/components/Button";
import { styled } from "@pigment-css/react";

const guestText =
  "Want to get future issues? Sign up to Peels and opt-in to the newsletter.";
// Interested? Sign up to Peels to receive future newsletter issues.
const guestAction = "Sign up";

const guest = {
  cta: {
    headline: "Get the newsletter",
    text: "Want to get future issues? Sign up to Peels and opt-in to the newsletter.",
  },
  button: {
    text: "Sign up",
    href: "/sign-up",
  },
};
const userTextNotYetSubscribed =
  "Want to get future issues? Edit your profile settings"; // TODO: Inline edit of this setting
const userTextAlreadySubscribed =
  "You’re already subscribed to the Peels newsletter. Feel free to share this page with a friend!";

function NewsletterCallout() {
  return (
    <Aside>
      <Text>
        <h2>{guest.cta.headline}</h2>
        <p>{guest.cta.text}</p>
      </Text>
      <Button variant="primary" href={guest.button.href}>
        {guest.button.text}
      </Button>
    </Aside>
  );
}

export default NewsletterCallout;

const Aside = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",

  // maxWidth: "512px",

  backgroundColor: theme.colors.background.top,
  padding: "2rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
}));

const Text = styled("div")({
  marginBottom: "2rem",
});
