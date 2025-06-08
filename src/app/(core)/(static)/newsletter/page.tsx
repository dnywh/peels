import { siteConfig } from "@/config/site";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import NewsletterCallout from "@/components/NewsletterCallout";
import StaticPageSection from "@/components/StaticPageSection";
import Link from "next/link";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import StaticPageMain from "@/components/StaticPageMain";

export const metadata = {
  title: "Newsletter",
  description: siteConfig.newsletter.description,
  openGraph: {
    title: `Newsletter · ${siteConfig.name}`,
    description: siteConfig.newsletter.description,
  },
};

export default function NewsletterPage() {
  return (
    <StaticPageMain>
      <StaticPageHeader
        title="Newsletter"
        subtitle={siteConfig.newsletter.description}
      />
      <StaticPageSection padding={null}>
        <NewsletterIssuesList />
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>Get these in your inbox</h2>
          <p>Opt-in to receive future issues of the newsletter via email.</p>
        </HeaderBlock>
        <NewsletterCallout />
        <FooterBlock>
          <p>
            Or subscribe to the{" "}
            <Link href="/newsletter/feed.xml">RSS feed</Link>.
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StaticPageMain>
  );
}
