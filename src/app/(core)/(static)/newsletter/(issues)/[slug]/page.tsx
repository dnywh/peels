// https://didoesdigital.com/blog/nextjs-blog-02-add-mdx/
// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import dynamic from "next/dynamic";
import Link from "next/link";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import NewsletterCallout from "@/components/NewsletterCallout";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import { getNewsletterIssueMetadata } from "@/app/(core)/(static)/newsletter/_lib/getNewsletterIssueData";
import StaticPageSection from "@/components/StaticPageSection";
import HeadingBlock from "@/components/HeadingBlock";

import type { Metadata } from "next/types";

// Update the type to make params a Promise
type NewsletterIssuePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: NewsletterIssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await getNewsletterIssueMetadata(slug);

  if (metadata) {
    return metadata;
  } else {
    throw new Error(`No metadata found for newsletter issue: ${slug}`);
  }
}

export async function generateStaticParams() {
  //   const newsletterIssues = ["celebrating-the-first-few-months", "second-post"]; // FIXME: Read from file system
  const newsletterIssues = await getAllNewsletterIssuesData();
  const newsletterIssuesStaticParams = newsletterIssues.map((issue) => ({
    slug: issue.slug,
  }));

  return newsletterIssuesStaticParams;
}

export default async function NewsletterIssuePage({
  params,
}: NewsletterIssuePageProps) {
  const { slug } = await params;
  const { metadata, customMetadata, formattedDate } =
    await getNewsletterIssueMetadata(slug);
  const title = `${metadata.title ?? ""}`;
  const authors = `${metadata.authors ?? ""}`;
  const issueNumber = customMetadata.issueNumber;

  //  Dynamically import MDX files
  const NewsletterIssueMarkdown = dynamic(
    () => import(`@/newsletter/${slug}.mdx`)
  );
  console.log(authors); // TODO: Open Graph authors

  return (
    <StaticPageMain>
      <div>
        <StaticPageHeader
          title={title}
          subtitle={`Issue #${issueNumber} · Published ${formattedDate}`}
          parent="Newsletter"
        />
        <LongformTextContainer>
          <NewsletterIssueMarkdown />
        </LongformTextContainer>
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

      <StaticPageSection>
        <HeadingBlock>
          <h2>Past issues</h2>
        </HeadingBlock>
        <NewsletterIssuesList activeSlug={slug} />
      </StaticPageSection>
    </StaticPageMain>
  );
}
