import { Suspense } from 'react';

import Button from "@/components/Button";
import Link from "next/link";
import PeelsLogo from "@/components/PeelsLogo";
import Toast from "@/components/Toast";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";


import { styled } from "@pigment-css/react";

const HeadingBlock = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  // gap: "1rem",
  textWrap: "balance",
  maxWidth: "720px",

  "& h2": {
    fontSize: "2rem",
    fontWeight: "700",
    color: theme.colors.text.brand.primary,
  },

  "& p": {
    fontSize: "1rem",
    color: theme.colors.text.ui.quaternary,
  },
}));

const DetailsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.colors.background.top,
  borderRadius: theme.corners.base,
  padding: `0 ${theme.spacing.unit}`,
  width: "100%",
  boxShadow: `0px 0px 0px 1px ${theme.colors.border.light}`,
}));

const StyledDetails = styled("details")(({ theme }) => ({
  padding: `0 calc(${theme.spacing.unit} * 1.5)`,


  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${theme.colors.border.base}`,
  },

  "& summary": {
    cursor: "pointer",
    borderRadius: theme.corners.base,
    transition: "opacity 150ms ease-in-out",

    "&:hover": {
      opacity: 0.65,
    },

    fontSize: "1.2rem",
    fontWeight: "500",
    color: theme.colors.text.ui.primary,
    padding: `calc(${theme.spacing.unit} * 3) 0`,

    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem",
  },

  "& p": {
    marginBottom: "0",
    color: theme.colors.text.ui.secondary,

    "& + p": {
      marginTop: "0.5rem",
    },

    "&:last-of-type": {
      marginBottom: "2rem",
    },
  },


}));

const Intro = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "1.5rem",
  maxWidth: "1024px",
}));

const StyledPeelsLogo = styled(PeelsLogo)({
  display: "block",
  "@media (min-width: 768px)": {
    display: "none",
  },
});

const StyledMain = styled("main")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  paddingTop: "15vh",
  gap: "8rem",
  marginBottom: "5rem",

  "@media (min-width: 768px)": {
    paddingTop: "16vh",
  },
});

const Heading1 = styled("h1")(({ theme }) => ({
  fontSize: "2.75rem",
  letterSpacing: "-0.03em",
  lineHeight: "1.05",
  fontWeight: "775",
  color: theme.colors.text.primary,

  "@media (min-width: 768px)": {
    fontSize: "4.5rem",
  },
}));

const HeroButtons = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: theme.spacing.tabBar.maxWidth, // Visually match width of tab bar on mobile
  justifyContent: "center",
  display: "flex",
  flexDirection: "column",
  gap: `calc(${theme.spacing.unit} * 2)`,

  "@media (min-width: 768px)": {
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
}));

const HeroParagraph = styled("p")(({ theme }) => ({
  fontSize: "1rem",
  // letterSpacing: "-0.02em",
  // lineHeight: "1.5",
  // fontWeight: "500",
  textWrap: "balance",
  color: theme.colors.text.ui.quaternary,

  "& a": {
    // color: theme.colors.text.secondary,
    color: "inherit",
    transition: "color 150ms ease-in-out",
    "&:hover": {
      color: theme.colors.text.primary,
    },
  },

  "@media (min-width: 768px)": {
    fontSize: "1.25rem",
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
        <StyledPeelsLogo size={40} />
        <Heading1>Find a home for your food scraps, wherever you are.</Heading1>

        <HeroParagraph>
          Peels connects folks with food scraps to those who compost. It’s a free, non-commercial, community project.
        </HeroParagraph>

        <HeroButtons>
          <Button href="/map" variant="primary" size="massive">
            Browse the map
          </Button>
          {/* TODO: {user ? <Link href="/profile#TODO-listing-form-for-signed-in-users">Create a listing</Link> : <Link href="/sign-up">Sign up</Link>} */}
          <Button href="/sign-up" variant="secondary" size="massive">
            Join the community
          </Button>
        </HeroButtons>
      </Intro>



      <Section>
        <HeadingBlock>
          <h2>You might be wondering...</h2>
          <p>Doesn’t this already exist? What’s your mission? You’ve got questions, we’ve (hopefully) got answers.</p>
        </HeadingBlock>

        <DetailsContainer>
          <StyledDetails name="faq">
            <summary>Who’s behind Peels?</summary>
            <p>
              Peels is a project led by <Hyperlink href="https://dannywhite.net" target="_blank">Danny White</Hyperlink>, an Australian product designer with 10 years experience working on products including Airbnb, ChatGPT, Kickstarter, and Facebook.
            </p>
            <p>
              Danny is passionate about food waste and composting. He helped start the composting program at Pocket City Farms, has worked on organic farms around the world, and has previously built a traveller’s guide to reducing food waste.
            </p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>How is Peels different to ShareWaste?</summary>
            <p>
              ShareWaste was a precursor to Peels with a similar idea: connecting people locally to divert organic material from landfill. Sadly, ShareWaste shut down at the end of 2024.
            </p>
            <p>
              Right now, we’re just trying to fill the gap that ShareWaste left. You can think of Peels as a direct replacement for ShareWaste.
            </p>
            <p>
              We’ve got plans to build out general area guides for composting and other features in the not too distant future.
            </p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>What’s the financial model? Are you non-profit?</summary>
            <p>
              Peels is a non-commercial, community-led project. We may incorporate as a not-for-profit in the future and accept funding for further development, but we never intend to start charging for the service.
            </p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>I have a FOGO bin. Is community composting still relevant?</summary>
            <p>
              Lucky you! Unfortunately, you’re in the minority. Most people don’t yet have access to kerbside compost collection. As long as that’s the case, there’ll be a need for community composting resources.
            </p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>I’m not comfortable putting my address on a map. Can I still participate?</summary>
            <p>
              Yes! We encourage folks with residential listings to ‘roughen’ their location to a nearby street corner or similar, and use a pseudonym if they feel more comfortable doing so.
            </p>
            <p>Even if you choose to use your real name and upload a photo, only signed in Peels members can see those details.</p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>I’d like to help build Peels. How do I get involved?</summary>
            <p>
              You’re awesome. <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">Email us</EncodedEmailHyperlink> and we’ll chat.
            </p>
          </StyledDetails>
          <StyledDetails name="faq">
            <summary>I represent local or state government. How can I get involved?</summary>
            <p>
              We’ve already partnered with councils from all over Australia, and are always keen to work with more (around the world, too!). Please <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">email us</EncodedEmailHyperlink> if you’d like to get involved.
            </p>
          </StyledDetails>
        </DetailsContainer>
      </Section>
    </StyledMain>
  );
}
