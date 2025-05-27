import { Suspense } from "react";

import { siteConfig } from "@/config/site";

import Link from "next/link";
import IntroHeader from "@/components/IntroHeader";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import PeelsHowItWorks from "@/components/PeelsHowItWorks";
import PeelsFaq from "@/components/PeelsFaq";

import { styled } from "@pigment-css/react";

export const metadata = {
  title: {
    absolute: `${siteConfig.name}: ${siteConfig.description}`,
  },
};

const StyledMain = styled("main")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  paddingTop: "10vh",
  gap: "5rem", // Match section paddingTop
  marginBottom: "5rem", // Match gap

  "@media (min-width: 768px)": {
    // paddingTop: "24vh",
    gap: "12vh", // Or ~12rem
    marginBottom: "12vh", // Match gap
  },
});

const Intro = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "1.5rem",

  "& > h1": {
    maxWidth: "24ch",
    fontSize: "2.75rem",
    letterSpacing: "-0.03em",
    lineHeight: "1.05",
    fontWeight: "775",
    color: theme.colors.text.primary,

    "@media (min-width: 768px)": {
      fontSize: "4.75rem",
    },
  },

  "& > p": {
    maxWidth: "56ch",
    textWrap: "balance",
    fontSize: "1.25rem",
    color: theme.colors.text.ui.quaternary,
    letterSpacing: "-0.028em",

    "@media (min-width: 768px)": {
      fontSize: "1.5rem",
    },
  },
}));

const HeroButtons = styled("div")(({ theme }) => ({
  marginTop: "1rem",
  width: "100%",
  maxWidth: theme.spacing.tabBar.maxWidth, // Visually match width of tab bar on mobile
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
  gap: `calc(${theme.spacing.unit} * 2)`,

  "@media (min-width: 768px)": {
    marginTop: "2rem",
    width: "fit-content",
    maxWidth: "none",
    flexDirection: "row",
  },
}));

const Section = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1.55rem",
  maxWidth: "720px",
  width: "100%",

  paddingTop: `5rem`, // Match page gap
  borderTop: `1px solid ${theme.colors.border.light}`,

  "@media (min-width: 768px)": {
    paddingTop: `12vh`, // Match page gap
    gap: "2.75rem",
  },
}));

const sharedSectionTextBlockStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",

  "& > *": {
    textAlign: "center",
    textWrap: "balance",
  },
};

const HeadingBlock = styled("div")(({ theme }) => ({
  ...sharedSectionTextBlockStyles,

  maxWidth: "720px",
  padding: `0 calc(${theme.spacing.unit} * 1.5)`,

  "& h2": {
    fontSize: "2.25rem",
    lineHeight: "115%",
    fontWeight: "720",
    color: theme.colors.text.brand.primary,
  },

  "& p": {
    fontSize: "1.15rem",
    letterSpacing: "-0.02em",
    color: theme.colors.text.ui.quaternary,
  },

  "@media (min-width: 768px)": {
    "& h2": {
      fontSize: "2.75rem",
    },
  },
}));

const FooterBlock = styled("footer")(({ theme }) => ({
  ...sharedSectionTextBlockStyles,
  "& p": {
    color: theme.colors.text.ui.quaternary,
  },

  "& a": {
    color: "inherit",
    transition: "color 150ms ease-in-out",
    "&:hover": {
      color: theme.colors.text.primary,
    },
  },
}));

export default function Index() {
  return (
    <StyledMain>
      {/* Moved search params to Toast component so that this page can remain static. Just requires Suspense here to work*/}
      <Suspense>
        <Toast />
      </Suspense>

      <Intro>
        <IntroHeader />
        <h1>Find a home for your food scraps, wherever you are</h1>

        <p>
          Peels connects folks with food scraps to those who compost. It’s a
          free, non-commercial, community project.
        </p>

        <HeroButtons>
          <Button href="/map" variant="primary" size="massive">
            Browse the map
          </Button>
          {/* TODO: {user ? <Link href="/profile#TODO-listing-form-for-signed-in-users">Create a listing</Link> : <Link href="/sign-up">Sign up</Link>} */}
          <Button href="/sign-up" variant="secondary" size="massive">
            {/* Join the community */}
            Sign up to Peels
          </Button>
        </HeroButtons>
      </Intro>

      <Section>
        <HeadingBlock>
          <h2>Here’s how it works</h2>
          <p>
            Sharing food scraps with neighbours, community gardens, or even
            local businesses is easy. Here’s how.
          </p>
        </HeadingBlock>
        <PeelsHowItWorks />
      </Section>

      <Section id="faq-section">
        <HeadingBlock>
          <h2>You might be wondering...</h2>
          <p>
            Doesn’t this already exist? What’s your mission? You’ve got
            questions, we’ve (hopefully) got answers.
          </p>
        </HeadingBlock>
        <PeelsFaq />
        <FooterBlock>
          <p>
            Head to our <Link href="/support">Support</Link> page if you have
            more questions.
          </p>
        </FooterBlock>
      </Section>
    </StyledMain>
  );
}
