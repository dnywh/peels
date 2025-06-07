import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import StyledList from "@/components/StyledList";

interface NewsletterIssuesListProps {
  activeSlug?: string | null;
}

export default async function NewsletterIssuesList({
  activeSlug = null,
}: NewsletterIssuesListProps) {
  const newsletterIssues = await getAllNewsletterIssues();

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
