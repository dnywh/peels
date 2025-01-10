import TabBar from "@/components/TabBar";
import LegalFooter from "@/components/LegalFooter";
import { styled } from "@pigment-css/react";
import AccountButton from "@/components/AccountButton";

const StyledAccountButton = styled(AccountButton)({
  position: "absolute",
  top: "1rem",
  right: "1rem",
});

const StaticPage = styled("div")({
  // Accounting for tab bar at bottom (should be dynamic)
  padding: "1.5rem 1.5rem 5rem 1.5rem",
  // height: "100dvh",
  "@media (min-width: 768px)": {
    padding: "5rem 10rem",
  },
});

export default async function Layout({ children }) {
  return (
    <StaticPage>
      <StyledAccountButton />
      <TabBar breakpoint="md" position="floating" />
      <div>
        {children}
        {/* <LoremIpsum /> */}
      </div>

      <LegalFooter />
      {/* If this tab bar is active, add an equivalent amount of padding-bottom to the page */}
      <TabBar breakpoint="sm" />
    </StaticPage>
  );
}
