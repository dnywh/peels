import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { styled } from "@pigment-css/react";

// This layout is used for pages that have centered, vertically-scrolling content
const CenteredPage = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "0.5rem",
  marginBottom: theme.spacing.tabBar.spaceFor, // Accommodate fixed TabBar on smaller devices

  "@media (min-width: 768px)": {
    marginBottom: "0",
    flexDirection: "row",
    alignItems: "stretch",
    gap: theme.spacing.gap.desktop,
    padding: "1.5rem",
  },
}));

export default async function Layout({ children, params }) {
  return (
    <TabBarProvider>
      <CenteredPage>
        <TabBar breakpoint="md" position="dynamic" />
        {children}
        <TabBar breakpoint="sm" />
      </CenteredPage>
    </TabBarProvider>
  );
}
