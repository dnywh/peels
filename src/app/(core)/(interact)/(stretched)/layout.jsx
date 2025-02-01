import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { styled } from "@pigment-css/react";

// This layout is used for pages that have content that always spans the full viewport width and height of the screen
const StretchedPage = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100dvh",

  "@media (min-width: 768px)": {
    flexDirection: "row",
    alignItems: "stretch",
    gap: theme.spacing.gap.desktop,
    padding: "1.5rem", //24px
  },
}));

export default async function Layout({ children, params }) {
  return (
    <TabBarProvider>
      <StretchedPage>
        <TabBar breakpoint="md" />
        {children}
        <TabBar breakpoint="sm" />
      </StretchedPage>
    </TabBarProvider>
  );
}
