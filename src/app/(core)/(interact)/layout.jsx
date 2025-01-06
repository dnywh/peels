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

export default async function Layout({ children, params }) {
  return (
    <InteractPage>
      <TabBar breakpoint="md" />
      {children}
      <TabBar breakpoint="sm" />
    </InteractPage>
  );
}
