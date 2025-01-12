import TabBar from "@/components/TabBar";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { styled } from "@pigment-css/react";

const InteractPage = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  backgroundColor: theme.colors.background.sunk,

  "@media (min-width: 768px)": {
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
        <TabBar breakpoint="md" />
        {children}
        <TabBar breakpoint="sm" />
      </InteractPage>
    </TabBarProvider>
  );
}
