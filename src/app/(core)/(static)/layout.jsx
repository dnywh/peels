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

const StaticPage = styled("div")(({ theme }) => ({
  padding: "1.5rem 1rem 0",
  marginBottom: `calc(${theme.spacing.tabBar.spaceFor} + 1rem)`,

  overflowX: "hidden", // Hide horizontal scrollbar on How It Works photo row

  "@media (min-width: 768px)": {
    marginBottom: "0",
    padding: "2rem 8rem 3rem",
  },
}));

export default async function Layout({ children }) {
  return (
    <TabBarProvider>
      <StaticPage>
        <StyledAccountButton />
        <TabBar breakpoint="md" position="fixed" />
        {children}
        <LegalFooter logo={true} />
        <TabBar breakpoint="sm" />
      </StaticPage>
    </TabBarProvider>
  );
}
