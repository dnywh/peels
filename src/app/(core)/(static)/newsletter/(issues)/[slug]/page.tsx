// https://didoesdigital.com/blog/nextjs-blog-02-add-mdx/
// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import dynamic from "next/dynamic";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterBody from "@/components/NewsletterBody";
import NewsletterCallout from "@/components/NewsletterCallout";
import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import { getNewsletterIssueMetadata } from "@/app/(core)/(static)/newsletter/_lib/getNewsletterIssueData";
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
  const { metadata, customMetadata } = await getNewsletterIssueMetadata(slug);
  const title = `${metadata.title ?? ""}`;
  const authors = `${metadata.authors ?? ""}`;
  const issueNumber = customMetadata.issueNumber;
  const dateOptions = {
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  };
  const publishDate = new Date(customMetadata.publishDate).toLocaleDateString(
    undefined, // varies according to local timezone and default locale
    dateOptions
  );
  const NewsletterIssueMarkdown = dynamic(
    () => import(`@/newsletter/${slug}.mdx`)
  );
  console.log(authors); // TODO: Open Graph authors

  return (
    <>
      <StaticPageHeader
        title={title}
        subtitle={`Issue #${issueNumber ?? "?"} · Sent ${publishDate}`}
        parent="Newsletter"
      />

      <NewsletterBody>
        <NewsletterIssueMarkdown />
      </NewsletterBody>

      <NewsletterCallout />
    </>
  );
}
