import { siteConfig } from "@/config/site";
import Link from "next/link";
import { styled } from "@pigment-css/react";

const currentYear = new Date().getFullYear();

const StyledFooter = styled("footer")({
  display: "flex",
  flexDirection: "row",
  gap: "1rem",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  flexWrap: "wrap",
  // padding: "1.5rem",
  // marginTop: "10rem",
});

function LegalFooter() {
  return (
    <StyledFooter>
      <p>
        © {currentYear} {siteConfig.name}
      </p>
      <Link href={siteConfig.links.about}>About</Link>
      <Link href={siteConfig.links.terms}>Terms</Link>
      <Link href={siteConfig.links.privacy}>Privacy</Link>
      <Link href={siteConfig.links.support}>Support</Link>
    </StyledFooter>
  );
}

export default LegalFooter;
