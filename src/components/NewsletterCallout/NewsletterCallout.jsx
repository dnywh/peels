import { useNewsletterStatus } from "@/hooks/useNewsletterStatus";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";

const userConfig = {
  alreadySubscribed: {
    title: "You’re already subscribed",
    description:
      "You should see the next issue appear in your email inbox. Feel free to share this page with a friend in the meantime!",
    button: {
      text: "Edit newsletter preferences",
      href: "/profile",
    },
  },
  notYetSubscribed: {
    title: "You’re not subscribed",
    description: "Change your newsletter preference on your Profile.",
    button: {
      text: "Edit newsletter preferences",
      href: "/profile",
    },
  },
};

// Advertising the newsletter (sits outside of the newsletter bounds)
// and providing information on how to opt-in (whether signed up already or not)
export default async function NewsletterCallout() {
  const { isNewsletterSubscribed, isAuthenticated } =
    await useNewsletterStatus();

  if (!isAuthenticated) {
    return (
      <Callout>
        <Text>
          <h2>Join Peels to get the newsletter</h2>
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
        <h2>
          {isNewsletterSubscribed
            ? userConfig.alreadySubscribed.title
            : userConfig.notYetSubscribed.title}
        </h2>
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

const ButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `calc(${theme.spacing.unit} * 2)`,
  // width: "fit-content",
  // maxWidth: "none",
}));
