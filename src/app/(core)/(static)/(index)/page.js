import { Suspense } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import IntroHeader from "@/components/IntroHeader";
import Button from "@/components/Button";
import Toast from "@/components/Toast";
import PeelsHowItWorks from "@/components/PeelsHowItWorks";
import PeelsFaq from "@/components/PeelsFaq";
import StaticPageSection from "@/components/StaticPageSection";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import { styled } from "@pigment-css/react";

export const metadata = {
  title: {
    absolute: `${siteConfig.name}: ${siteConfig.description}`,
  },
};


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

      <StaticPageSection padding="lg">
        <HeaderBlock>
          <h2>Here’s how it works</h2>
          <p>
            Sharing food scraps with neighbours, community gardens, or even
            local businesses is easy. Here’s how.
          </p>
        </HeaderBlock>
        <PeelsHowItWorks />
      </StaticPageSection>

      <StaticPageSection padding="lg" id="newsletter-section">
        <HeaderBlock>
          <h2>What’s new</h2>
          <p>
            {siteConfig.newsletter.description}
          </p>
        </HeaderBlock>
        <NewsletterIssuesList />
        <FooterBlock>
          <p>
            Check out our <Link href="/newsletter">Newsletter</Link> page for all past issues and how to subscribe.
          </p>
        </FooterBlock>
      </StaticPageSection>

      <StaticPageSection padding="lg" id="faq-section">
        <HeaderBlock>
          <h2>You might be wondering...</h2>
          <p>
            Doesn’t this already exist? What’s your mission? You’ve got
            questions, we’ve (hopefully) got answers.
          </p>
        </HeaderBlock>
        <PeelsFaq />
        <FooterBlock>
          <p>
            Head to our <Link href="/support">Support</Link> page if you have
            more questions.
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StyledMain>
  );
}

const StyledMain = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  paddingTop: "10vh",
  gap: theme.spacing.gap.page.md, // Match section paddingTop
  // marginBottom: theme.spacing.gap.page.md, // Match gap

  "@media (min-width: 768px)": {
    // paddingTop: "24vh",
    gap: theme.spacing.gap.page.lg, // Or ~12rem
    // marginBottom: theme.spacing.gap.page.lg, // Match gap
  },
}));

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

