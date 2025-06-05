import { siteConfig } from "@/config/site";
import Link from "next/link";
import PeelsLogo from "@/components/PeelsLogo";
import { styled } from "@pigment-css/react";

const currentYear = new Date().getFullYear();

const StyledFooter = styled("footer")(({ theme }) => ({
  marginTop: "5rem", // Fallback if prior sibling has no marginBottom defined
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  color: theme.colors.text.ui.emptyState,

  "& p": {
    fontSize: "0.875rem", // Match links below
  },
}));

const StyledNav = styled("nav")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem 0.75rem",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  flexWrap: "wrap",
  padding: "0 2.5rem", // Inset slightly for balanced wrapping
  fontSize: "0.875rem",

  "& a": {
    margin: 0,
    fontWeight: "500",
    color: theme.colors.text.ui.emptyState,
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
      <PeelsLogo color="quaternary" />
      <p>
        © {currentYear} {siteConfig.name}
      </p>

      <StyledNav>
        <Link href={siteConfig.links.about}>About</Link>
        <Link href={siteConfig.links.support}>Support</Link>
        <Link href={siteConfig.links.newsletter}>Newsletter</Link>
        <Link href={siteConfig.links.colophon}>Colophon</Link>
        <Link href={siteConfig.links.terms}>Terms</Link>
        <Link href={siteConfig.links.privacy}>Privacy</Link>
      </StyledNav>
    </StyledFooter>
  );
}

export default LegalFooter;
