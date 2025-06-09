"use client"; // For useNewsletterStatus
import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import Button from "@/components/Button";
import PostageStamp from "@/components/PostageStamp";
import { styled } from "@pigment-css/react";

const userConfig = {
  alreadySubscribed: {
    title: "You’re already subscribed",
    description:
      "You should see the next issue appear in your email inbox. Feel free to share this page with a friend in the meantime!",
    button: {
      text: "Edit newsletter preference",
      href: "/profile",
    },
  },
  notYetSubscribed: {
    title: "You’re not subscribed",
    description: "Change your newsletter preference on your Profile page.",
    button: {
      text: "Edit newsletter preference",
      href: "/profile",
    },
  },
};

function UnauthenticatedCallout() {
  return (
    <Callout>
      <PostageStamp />
      <Text>
        <h3>Join Peels to get the newsletter</h3>
        <p>
          You need to be a member of Peels to get the newsletter via email.
          Signing up is free and only takes a few seconds.
        </p>
      </Text>
      <ButtonContainer>
        <Button variant="primary" href="/sign-up?newsletter_preference=true">
          Join Peels
        </Button>
        <Button variant="secondary" href="/sign-in">
          Sign in
        </Button>
      </ButtonContainer>
    </Callout>
  );
}

// Advertising the newsletter (sits outside of the newsletter bounds)
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterAside which does a similar job, albeit inside the newsletter bounds
export default function NewsletterCallout() {
  const status = useNewsletterStatus();

  if (status.isLoading || status.error || !status.isAuthenticated) {
    return <UnauthenticatedCallout />;
  }

  return (
    <Callout>
      <PostageStamp />
      <Text>
        <h3>
          {status.isNewsletterSubscribed
            ? userConfig.alreadySubscribed.title
            : userConfig.notYetSubscribed.title}
        </h3>
        <p>
          {status.isNewsletterSubscribed
            ? userConfig.alreadySubscribed.description
            : userConfig.notYetSubscribed.description}
        </p>
      </Text>
      <Button
        variant={status.isNewsletterSubscribed ? "secondary" : "primary"}
        href={userConfig.notYetSubscribed.button.href}
      >
        {userConfig.notYetSubscribed.button.text}
      </Button>
    </Callout>
  );
}

const Callout = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.aside,
  containerType: "inline-size", // Establish container context
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.corners.base,
  background: theme.colors.background.top,
  border: `1px solid ${theme.colors.border.base}`,
  overflow: "hidden",
  position: "relative",
}));

const Text = styled("div")(({ theme }) => ({
  marginBottom: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  "& > *": {
    textWrap: "balance",
  },

  "& > h3": {
    color: theme.colors.text.ui.secondary,
    fontWeight: 500,
    fontSize: "1.5rem",
    lineHeight: theme.typography.lineHeight.h,
    // Offset backgroundImage to the side of this text
    marginTop: "2.5rem",
    marginRight: "7.5rem",
  },
}));

const ButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `calc(${theme.spacing.unit} * 2)`,
}));
