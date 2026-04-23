import { siteConfig } from "@/config/site";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import NewsletterCallout from "@/components/NewsletterCallout";
import StaticPageSection from "@/components/StaticPageSection";
import Link from "next/link";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import StaticPageMain from "@/components/StaticPageMain";
import { styled } from "next-yak";
import { getLocale, getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/config";
import { theme } from "@/styles/theme.yak";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  const description = t("description");

  return {
    title: t("title"),
    description,
    openGraph: {
      title: `${t("title")} · ${siteConfig.name}`,
      description,
    },
  };
}

export default async function NewsletterPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  const rssHref =
    locale === defaultLocale
      ? "/newsletter/feed.xml"
      : `/newsletter/feed.xml?locale=${locale}`;

  return (
    <StaticPageMain>
      <AboveTheFoldSection>
        <StaticPageHeader title={t("title")} subtitle={t("description")} />
        <NewsletterIssuesList />
      </AboveTheFoldSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("inboxTitle")}</h2>
          <p>{t("inboxDescription")}</p>
        </HeaderBlock>
        <NewsletterCallout />
        <FooterBlock>
          <p>
            {t.rich("rss", {
              link: (chunks) => <Link href={rssHref}>{chunks}</Link>,
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StaticPageMain>
  );
}

const AboveTheFoldSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
  gap: ${theme.spacing.gap.section.md};
  @media (min-width: 768px) {
    gap: ${theme.spacing.gap.section.lg};
  }
`;
