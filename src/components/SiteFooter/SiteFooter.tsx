import { siteConfig } from "@/config/site";
import Link from "next/link";
import { cookies } from "next/headers";
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
        <Link href={siteConfig.links.about} prefetch={false}>
          {t("App.about")}
        </Link>
        <Link href={siteConfig.links.support} prefetch={false}>
          {t("Support.title")}
        </Link>
        <Link href={siteConfig.links.newsletter} prefetch={false}>
          {t("Newsletter.title")}
        </Link>
        {/* <Link href={siteConfig.links.colophon}>Colophon</Link> */}
        <Link href={siteConfig.links.terms} prefetch={false}>
          {t("Legal.terms")}
        </Link>
        <Link href={siteConfig.links.privacy} prefetch={false}>
          {t("Legal.privacy")}
        </Link>
        <Link href={siteConfig.links.contact} prefetch={false}>
          {t("Contact.title")}
        </Link>
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
