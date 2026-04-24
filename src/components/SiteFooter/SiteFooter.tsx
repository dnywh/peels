import { siteConfig } from "@/config/site";
import { cookies } from "next/headers";
import AppLink from "@/components/AppLink";
import PeelsLogo from "@/components/PeelsLogo";
import LocalePicker from "@/components/LocalePicker";
import { styled } from "next-yak";
import { getTranslations } from "next-intl/server";
import { hasSupabaseAuthCookie } from "@/utils/supabase/authCookies";
import { theme } from "@/styles/theme.yak";

const currentYear = new Date().getFullYear();

export default async function SiteFooter() {
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
        <AppLink href={siteConfig.links.about}>{t("App.about")}</AppLink>
        <AppLink href={siteConfig.links.support}>{t("Support.title")}</AppLink>
        <AppLink href={siteConfig.links.newsletter}>
          {t("Newsletter.title")}
        </AppLink>
        {/* <Link href={siteConfig.links.colophon}>Colophon</Link> */}
        <AppLink href={siteConfig.links.terms}>{t("Legal.terms")}</AppLink>
        <AppLink href={siteConfig.links.privacy}>{t("Legal.privacy")}</AppLink>
        <AppLink href={siteConfig.links.contact}>{t("Contact.title")}</AppLink>
      </StyledNav>
    </StyledFooter>
  );
}

const StyledFooter = styled.footer`
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: ${theme.colors.text.ui.emptyState};
  & p {
    font-size: 0.875rem;
  }
`;

const StyledNav = styled.nav`
  display: flex;
  flex-direction: row;
  gap: 0.75rem 1.25rem;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-wrap: wrap;
  padding: 0 2.5rem;
  font-size: 0.875rem;
  & a {
    margin: 0;
    font-weight: 500;
    color: ${theme.colors.text.ui.emptyState};
    transition: ${theme.transitions.textColor};
    &:hover {
      color: ${theme.colors.text.secondary};
    }
  }
  @media (min-width: 768px) {
    gap: 1.25rem;
    padding: 0 3.5rem;
  }
`;
