import { Suspense } from 'react';

import Button from "@/components/Button";
import PeelsLogo from "@/components/PeelsLogo";
import Toast from "@/components/Toast";
import Hyperlink from "@/components/Hyperlink";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import PeelsFaq from "@/components/PeelsFaq";


import { styled } from "@pigment-css/react";

const HeadingBlock = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  // gap: "1rem",

  maxWidth: "720px",
  padding: `0 calc(${theme.spacing.unit} * 1.5)`,

  "& h2": {
    fontSize: "2rem",
    fontWeight: "700",
    color: theme.colors.text.brand.primary,
    textWrap: "balance",
  },

  "& p": {
    fontSize: "1rem",
    color: theme.colors.text.ui.quaternary,
    textWrap: "balance",
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

        <PeelsFaq />
      </Section>
    </StyledMain>
  );
}
