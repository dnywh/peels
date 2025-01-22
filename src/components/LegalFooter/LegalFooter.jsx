import { siteConfig } from "@/config/site";
import Link from "next/link";
import { styled } from "@pigment-css/react";

const currentYear = new Date().getFullYear();

const StyledFooter = styled("footer")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "0.75rem",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  flexWrap: "wrap",
  padding: "0 1.5rem",
  // marginTop: "10rem",
  color: theme.colors.text.quaternity,
  fontSize: "1rem",

  "& a": {
    color: theme.colors.text.quaternity,
    transition: "color 150ms ease-in-out",
    "&:hover": {
      color: theme.colors.text.secondary,
    },
  },

  "@media (min-width: 768px)": {
    gap: "1.25rem",
  },
}));

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
      <Link href={siteConfig.links.colophon}>Colophon</Link>
    </StyledFooter>
  );
}

export default LegalFooter;
