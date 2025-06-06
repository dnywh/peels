import Link from "next/link";
import HeaderBlock from "@/components/HeaderBlock";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";

const guest = {
  cta: {
    headline: "You’re not signed in",
    text: "Join Peels to opt-in to the newsletter.",
  },
  button: {
    text: "Sign up",
    href: "/sign-up",
  },
};

const user = {
  cta: {
    headline: "You’re not subscribed",
    text: "Change your newsletter preference on your Profile.",
  },
  button: {
    text: "Edit newsletter preference",
    href: "/profile",
  },
};

const userTextAlreadySubscribed =
  "You’re already subscribed to the Peels newsletter. Feel free to share this page with a friend!";

// Advertising the newsletter (sits outside of the newsletter bounds)
function NewsletterCallout() {
  return (
    <Callout>
      <Text>
        <h2>{guest.cta.headline}</h2>
        <p>{guest.cta.text}</p>
      </Text>
      <Button variant="primary" href={guest.button.href}>
        {guest.button.text}
      </Button>
    </Callout>
  );
}

export default NewsletterCallout;

const Callout = styled("section")(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.aside,

  display: "flex",
  flexDirection: "column",

  backgroundColor: theme.colors.background.top,
  padding: "2rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
}));

const Text = styled("div")({
  marginBottom: "2rem",
});
