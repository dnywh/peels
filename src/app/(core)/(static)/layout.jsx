import TabBar from "@/components/TabBar";
import LegalFooter from "@/components/LegalFooter";
import LoremIpsum from "@/components/LoremIpsum";
import { styled } from "@pigment-css/react";

const StaticPage = styled("div")({
  // Accounting for tab bar at bottom (should be dynamic)
  padding: "1.5rem 1.5rem 5rem 1.5rem",
  // height: "100dvh",
  "@media (min-width: 768px)": {
    padding: "5rem 10rem",
  },
});

const StyledMdTabBar = styled(TabBar)({
  display: "none",
  "@media (min-width: 768px)": {
    display: "block",
  },
});

const StyledSmTabBar = styled(TabBar)({
  display: "block",
  "@media (min-width: 768px)": {
    display: "none",
  },
});

export default async function Layout({ children }) {
  return (
    <StaticPage>
      {/* TODO: Show full tab bar but with the following differences from the interactive pages:
      1. The desktop tab bar should be removed from the page positioning (floating on top-left, not affecting layout of rest of page contents)
      2. Neither tab bar should be visible if the user is logged out (how does this user logged in/out check occur? Where?)
      */}
      <StyledMdTabBar breakpoint="md" position="floating" />
      <div>
        {children}
        {/* <LoremIpsum /> */}
      </div>

      <LegalFooter />
      {/* If this tab bar is active, add an equivalent amount of padding-bottom to the page */}
      <StyledSmTabBar breakpoint="sm" />
    </StaticPage>
  );
}
