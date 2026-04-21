import { siteConfig } from "@/config/site";
import Link from "next/link";
import { cookies } from "next/headers";
import PeelsLogo from "@/components/PeelsLogo";
import LocalePicker from "@/components/LocalePicker";
import { styled } from "@pigment-css/react";
import { getTranslations } from "next-intl/server";
import { hasSupabaseAuthCookie } from "@/utils/supabase/authCookies";

const currentYear = new Date().getFullYear();

export default async function LegalFooter() {
  const t = await getTranslations();
  const cookieStore = await cookies();
  const hasSignedInSession = hasSupabaseAuthCookie(cookieStore.getAll());

  return (
    <StyledFooter>
      <PeelsLogo color="quaternary" />
      <p>
        © {currentYear} {siteConfig.name}
      </p>

      {!hasSignedInSession && <LocalePicker compact={true} />}

      <StyledNav>
        <Link href={siteConfig.links.about}>{t("App.about")}</Link>
        <Link href={siteConfig.links.support}>{t("Support.title")}</Link>
        <Link href={siteConfig.links.newsletter}>{t("Newsletter.title")}</Link>
        {/* <Link href={siteConfig.links.colophon}>Colophon</Link> */}
        <Link href={siteConfig.links.terms}>{t("Legal.terms")}</Link>
        <Link href={siteConfig.links.privacy}>{t("Legal.privacy")}</Link>
        <Link href={siteConfig.links.contact}>{t("Contact.title")}</Link>
      </StyledNav>
    </StyledFooter>
  );
}

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
  gap: "0.75rem 1.25rem",
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
    transition: theme.transitions.textColor,
    "&:hover": {
      color: theme.colors.text.secondary,
    },
  },

  "@media (min-width: 768px)": {
    gap: "1.25rem",
    padding: "0 3.5rem",
  },
}));
