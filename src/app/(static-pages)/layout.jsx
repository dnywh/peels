import LegalFooter from "@/components/LegalFooter";
import { styled } from "@pigment-css/react";

const StaticPage = styled("main")({
  // TODO: How do I reach out and set the body colour here conditionally
  // backgroundColor: "#C5BFB9",
});

export default async function Layout({ children }) {
  return (
    <>
      <StaticPage>{children}</StaticPage>
      {/* Shared footer  */}
      <LegalFooter />
    </>
  );
}
