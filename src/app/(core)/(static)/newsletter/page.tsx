// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import { siteConfig } from "@/config/site";
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import NewsletterCallout from "@/components/NewsletterCallout";
import StaticPageSection from "@/components/StaticPageSection";
import Link from "next/link";
import HeadingBlock from "@/components/HeadingBlock";
import Hyperlink from "@/components/Hyperlink";
import { styled } from "@pigment-css/react";
import StaticPageMain from "@/components/StaticPageMain";

export const metadata = {
  title: "Newsletter",
  description: siteConfig.newsletter.description,
  //   TODO: Why is the above not inherited automatically in Open Graph?
  //  The below show be templatised, if used
  //   openGraph: {
  //     title: "Newsletter",
  //     description: siteConfig.newsletter.description,
  //   },
};

export default function NewsletterPage() {
  return (
    <StaticPageMain>
      <div>
        <StaticPageHeader
          title="Newsletter"
          subtitle={
            <>
              {siteConfig.newsletter.description}{" "}
              <Link href={siteConfig.links.join}>Join Peels</Link> to get future
              issues in your inbox.
            </>
          }
        />
        <NewsletterIssuesList />
      </div>

      <StaticPageSection>
        <HeadingBlock>
          <h2>Get these in your inbox</h2>
          <p>
            Opt-in to receive future issues of the newsletter via email. Or
            subscribe to the <Link href="/newsletter/feed.xml">RSS feed</Link>.
          </p>
        </HeadingBlock>
        <NewsletterCallout />
      </StaticPageSection>
    </StaticPageMain>
  );
}
