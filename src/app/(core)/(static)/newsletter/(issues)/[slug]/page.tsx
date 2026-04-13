import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next/types";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import NewsletterCallout from "@/components/NewsletterCallout";
import { siteConfig } from "@/config/site";
import { getAllContentSlugs } from "@/lib/content/utils";
import { getNewsletterIssueMetadata } from "@/lib/content/handlers/newsletter";
import StaticPageSection from "@/components/StaticPageSection";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import { getNewsletterIssueImageUrl } from "@/utils/storage";
import { getTranslations } from "next-intl/server";

type NewsletterIssuePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: NewsletterIssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { metadata, customMetadata } = await getNewsletterIssueMetadata(slug);

  if (metadata) {
    return {
      ...metadata,
      openGraph: {
        ...metadata.openGraph,
        images: [
          {
            url: getNewsletterIssueImageUrl(
              customMetadata.issueNumber,
              customMetadata.ogImage
            ),
          },
        ],
        type: "article",
        authors: metadata.authors,
      },
    };
  } else {
    throw new Error(`No metadata found for newsletter issue: ${slug}`);
  }
}

export async function generateStaticParams() {
  const slugs = await getAllContentSlugs("newsletter");
  return slugs.map((slug) => ({ slug }));
}

export default async function NewsletterIssuePage({
  params,
}: NewsletterIssuePageProps) {
  const { slug } = await params;
  const t = await getTranslations("Newsletter");
  const { metadata, customMetadata, formattedDate } =
    await getNewsletterIssueMetadata(slug);
  const title = customMetadata.verboseTitle
    ? customMetadata.verboseTitle
    : metadata.title;
  // const authors = `${metadata.authors ?? ""}`;
  const issueNumber = customMetadata.issueNumber;

  //  Dynamically import MDX files
  const NewsletterIssueMarkdown = dynamic(
    () => import(`@/content/newsletter/${slug}.mdx`)
  );
  //   console.log(authors); // TODO: Open Graph authors

  return (
    // Largely matches (legal) page.tsx, with some additions below the textual content
    <StaticPageMain>
      {/* Nest header and main content together so they visually hug */}
      <section>
        <StaticPageHeader
          title={title}
          subtitle={t("issueSubtitle", {
            number: issueNumber,
            date: formattedDate,
          })}
          parent={t("parent")}
        />
        <LongformTextContainer>
          <NewsletterIssueMarkdown />
        </LongformTextContainer>
      </section>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("inboxTitle")}</h2>
          <p>{siteConfig.newsletter.description}</p>
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
