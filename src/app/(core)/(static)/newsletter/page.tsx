import { siteConfig } from "@/config/site";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import NewsletterCallout from "@/components/NewsletterCallout";
import StaticPageSection from "@/components/StaticPageSection";
import Link from "next/link";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import StaticPageMain from "@/components/StaticPageMain";
import { styled } from "@pigment-css/react";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Newsletter",
  description: siteConfig.newsletter.description,
  openGraph: {
    title: `Newsletter · ${siteConfig.name}`,
    description: siteConfig.newsletter.description,
  },
};

export default async function NewsletterPage() {
  const t = await getTranslations("Newsletter");

  return (
    <StaticPageMain>
      <AboveTheFoldSection>
        <StaticPageHeader
          title={t("title")}
          subtitle={siteConfig.newsletter.description}
        />
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
              link: (chunks) => (
                <Link href="/newsletter/feed.xml">{chunks}</Link>
              ),
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StaticPageMain>
  );
}

const AboveTheFoldSection = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  maxWidth: theme.spacing.container.maxWidth.media,
  gap: theme.spacing.gap.section.md,

  "@media (min-width: 768px)": {
    gap: theme.spacing.gap.section.lg,
  },
}));
