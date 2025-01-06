import TabBar from "@/components/TabBar";
import { styled } from "@pigment-css/react";

const InteractPage = styled("div")({
  // TODO: How do I reach out and set the body colour here conditionally
  // backgroundColor: "#F8F6F3",
  // alignItems: "center",
  display: "flex",
  flexDirection: "column",
  height: "100dvh",
  "@media (min-width: 768px)": {
    flexDirection: "row",
    alignItems: "stretch",
    gap: "1.5rem",
    padding: "1.5rem", //24px
  },
});

const MdTabBar = styled(TabBar)({
  display: "none",
  "@media (min-width: 768px)": {
    display: "block",
  },
});

const SmTabBar = styled(TabBar)({
  display: "block",
  "@media (min-width: 768px)": {
    display: "none",
  },
});

export default async function Layout({ children, params }) {
  return (
    <InteractPage>
      <MdTabBar breakpoint="md" />
      {children}
      <SmTabBar breakpoint="sm" />
    </InteractPage>
  );
}
