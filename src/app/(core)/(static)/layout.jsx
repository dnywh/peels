import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
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
  padding: "1.5rem 1rem 5rem",
  // height: "100dvh",
  "@media (min-width: 768px)": {
    padding: "5rem 8rem",
  },
});

export default async function Layout({ children }) {
  return (
    <TabBarProvider>
      <StaticPage>
        <StyledAccountButton />
        <TabBar breakpoint="md" position="fixed" />
        {children}
        <LegalFooter />
        <TabBar breakpoint="sm" />
      </StaticPage>
    </TabBarProvider>
  );
}
