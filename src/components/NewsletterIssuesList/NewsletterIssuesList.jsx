// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import { siteConfig } from "@/config/site";
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import HeadingBlock from "@/components/HeadingBlock";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import NewsletterCallout from "@/components/NewsletterCallout";
import Hyperlink from "@/components/Hyperlink";
import StyledList from "@/components/StyledList";
import { styled } from "@pigment-css/react";

export default async function NewsletterIssuesList({ activeSlug = null }) {
  const newsletterIssues = await getAllNewsletterIssuesData();

  // Importing StyledList as a separate, barebones, slightly-styled component to avoid Pigment CSS + Next.js server component boundary issues
  return (
    <StyledList>
      {newsletterIssues.map(
        (
          {
            slug,
            metadata: { title },
            customMetadata: { issueNumber, featuredImages },
            formattedDate,
          },
          index
        ) =>
          activeSlug !== slug && (
            <NewsletterIssueRow
              key={slug}
              featured={index === 0}
              slug={slug}
              title={title}
              issueNumber={issueNumber}
              date={formattedDate}
              featuredImages={featuredImages}
            />
          )
      )}
    </StyledList>
  );
}
