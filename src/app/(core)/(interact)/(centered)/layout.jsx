import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { styled } from "@pigment-css/react";

// This layout is used for pages that have centered, vertically-scrolling content
const InteractPage = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "0.5rem",

  marginBottom: "6rem", // Accommodate TabBar

  "@media (min-width: 768px)": {
    marginBottom: "0",

    flexDirection: "row",
    alignItems: "stretch",
    gap: "1.5rem",
    padding: "1.5rem", //24px
  },
}));

export default async function Layout({ children, params }) {
  return (
    <TabBarProvider>
      <InteractPage>
        <TabBar breakpoint="md" position="dynamic" />
        {children}
        <TabBar breakpoint="sm" />
      </InteractPage>
    </TabBarProvider>
  );
}
