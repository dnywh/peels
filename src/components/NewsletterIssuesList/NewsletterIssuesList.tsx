import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import StyledList from "@/components/StyledList";
import PastIssuesList from "@/components/PastIssuesList";

export default async function NewsletterIssuesList() {
  const newsletterIssues = await getAllNewsletterIssues();

  // Importing StyledList as a separate, barebones, slightly-styled component to avoid Pigment CSS + Next.js server component boundary issues
  return (
    <>
      <StyledList>
        <section>
          <h2>Latest issue</h2>
          <NewsletterIssueRow
            featured={true}
            slug={newsletterIssues[0].slug}
            title={newsletterIssues[0].metadata.title}
            issueNumber={newsletterIssues[0].customMetadata.issueNumber}
            date={newsletterIssues[0].formattedDate}
            featuredImages={newsletterIssues[0].customMetadata.featuredImages}
          />
        </section>

        {newsletterIssues.length > 1 && (
          <section>
            <h2>Past issues</h2>
            <PastIssuesList>
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
                  index > 0 && (
                    <NewsletterIssueRow
                      key={slug}
                      featured={false}
                      slug={slug}
                      title={title}
                      issueNumber={issueNumber}
                      date={formattedDate}
                      featuredImages={featuredImages}
                    />
                  )
              )}
            </PastIssuesList>
          </section>
        )}
      </StyledList>
    </>
  );
}
