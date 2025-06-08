import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import Button from "@/components/Button";
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

// Advertising the newsletter (sits outside of the newsletter bounds)
// and providing information on how to opt-in (whether signed up already or not)
// See also NewsletterAside which does a similar job, albeit inside the newsletter bounds
export default async function NewsletterCallout() {
  const { isNewsletterSubscribed, isAuthenticated } =
    await useNewsletterStatus();

  if (!isAuthenticated) {
    return (
      <Callout>
        <Text>
          <h3>Join Peels to get the newsletter</h3>
          <p>
            You need to be a member of Peels to get the newsletter via email.
            Signing up is free and only takes a few seconds.
          </p>
        </Text>
        <ButtonContainer>
          <Button variant="primary" href="/sign-up">
            Join Peels
          </Button>
          <Button variant="secondary" href="/sign-in">
            Sign in
          </Button>
        </ButtonContainer>
      </Callout>
    );
  }

  return (
    <Callout>
      <Text>
        <h3>
          {isNewsletterSubscribed
            ? userConfig.alreadySubscribed.title
            : userConfig.notYetSubscribed.title}
        </h3>
        <p>
          {isNewsletterSubscribed
            ? userConfig.alreadySubscribed.description
            : userConfig.notYetSubscribed.description}
        </p>
      </Text>
      <Button
        variant={isNewsletterSubscribed ? "secondary" : "primary"}
        href={userConfig.notYetSubscribed.button.href}
      >
        {userConfig.notYetSubscribed.button.text}
      </Button>
    </Callout>
  );

  //   // Get user and profile data
  //   const supabase = await createClient();
  //   const {
  //     data: { user },
  //     error,
  //   } = await supabase.auth.getUser();

  //   if (!user || error) {
  //     return (
  //       <Callout>
  //         <Text>
  //           <h2>Join Peels to get the newsletter</h2>
  //           <p>
  //             You need to be a member of Peels to get the newsletter via email.
  //             Signing up is free and only takes a few seconds.
  //           </p>
  //         </Text>
  //         <ButtonContainer>
  //           <Button variant="primary" href="/sign-up">
  //             Join Peels
  //           </Button>
  //           <Button variant="secondary" href="/sign-in">
  //             Sign in
  //           </Button>
  //         </ButtonContainer>
  //       </Callout>
  //     );
  //   }

  //   const { data: profile } = await supabase
  //     .from("profiles")
  //     .select()
  //     .eq("id", user.id)
  //     .single();

  //   const isNewsletterSubscribed = profile.is_newsletter_subscribed;

  //   return (
  //     <Callout>
  //       <Text>
  //         <h2>
  //           {isNewsletterSubscribed
  //             ? userConfig.alreadySubscribed.title
  //             : userConfig.notYetSubscribed.title}
  //         </h2>
  //         <p>
  //           {isNewsletterSubscribed
  //             ? userConfig.alreadySubscribed.description
  //             : userConfig.notYetSubscribed.description}
  //         </p>
  //       </Text>
  //       <Button
  //         variant={isNewsletterSubscribed ? "secondary" : "primary"}
  //         href={userConfig.notYetSubscribed.button.href}
  //       >
  //         {userConfig.notYetSubscribed.button.text}
  //       </Button>
  //     </Callout>
  //   );
}

const Callout = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.aside,
  containerType: "inline-size", // Establish container context
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,
  backgroundColor: theme.colors.background.top,
  overflow: "hidden",
  position: "relative",

  // Pseudo-element needed to rotate background
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    background: "url('/stamp.png') no-repeat top right",
    backgroundSize: "224px",
    opacity: 0.75,
    maskImage: "radial-gradient(rgba(0,0,0,.5) 0%, rgba(0,0,0,0.15) 72%)",
    transform: "rotate(-16deg) translate(96px, 8px)",

    "@container (min-width: 446px)": {
      transform: "rotate(-16deg) translate(80px, 28px)",
    },
  },
}));

const Text = styled("div")(({ theme }) => ({
  marginBottom: "2rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginTop: "3.5rem", // Offset backgroundImage above this text

  // Calc theme.spacing.container.maxWidth.aside - paddingX - borders (512-32-32-1-1=446)
  "@container (min-width: 446px)": {
    marginTop: "1rem",
    marginRight: "8.25rem", // Offset backgroundImage to the side of this text
  },

  "& > *": {
    textWrap: "balance",
  },

  "& > h3": {
    color: theme.colors.text.ui.secondary,
    fontWeight: 500,
    fontSize: "1.5rem",
    lineHeight: "110%",
  },
}));

const ButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `calc(${theme.spacing.unit} * 2)`,
}));
