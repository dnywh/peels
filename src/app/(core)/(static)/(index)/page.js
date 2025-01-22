import { Suspense } from 'react';
import Button from "@/components/Button";
import Link from "next/link";
import PeelsLogo from "@/components/PeelsLogo";
import Toast from "@/components/Toast";
import { styled } from "@pigment-css/react";

const Intro = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "1.5rem",
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
  textAlign: "center",
  paddingTop: "15vh",
  gap: "3.5rem",
  marginBottom: "5rem",

  "@media (min-width: 768px)": {
    paddingTop: "16vh",
  },
});

const Heading1 = styled("h1")(({ theme }) => ({
  fontSize: "2.75rem",
  letterSpacing: "-0.03em",
  lineHeight: "1.05",
  fontWeight: "700",
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
  gap: "0.75rem",
}));

const HeroParagraph = styled("p")(({ theme }) => ({
  fontSize: "1.2rem",
  letterSpacing: "-0.02em",
  lineHeight: "1.5",
  fontWeight: "500",
  textWrap: "balance",
  color: theme.colors.text.quaternity,

  "& a": {
    // color: theme.colors.text.secondary,
    color: "inherit",
    transition: "color 150ms ease-in-out",
    "&:hover": {
      color: theme.colors.text.primary,
    },
  },

  "@media (min-width: 768px)": {
    fontSize: "1.6rem",
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
      </Intro>

      <HeroButtons>
        <Button href="/map" variant="primary" size="massive">
          Browse the map
        </Button>
        {/* TODO: {user ? <Link href="/profile#TODO-listing-form-for-signed-in-users">Create a listing</Link> : <Link href="/sign-up">Sign up</Link>} */}
        <Button href="/sign-up" variant="secondary" size="massive">
          Get involved
        </Button>
      </HeroButtons>

      <Section>
        <HeroParagraph>
          Peels connects folks with food scraps to those who can use them for compost, chooks, red wigglers, and more.
        </HeroParagraph>
        <HeroParagraph>
          We’ve just started to build our community and would love to see you there. <Link href="/sign-up">Sign up</Link> to put your mark on the map.
        </HeroParagraph>
      </Section>
    </StyledMain>
  );
}
