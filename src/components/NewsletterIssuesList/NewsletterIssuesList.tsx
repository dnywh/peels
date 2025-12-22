import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import NewsletterIssueTile from "@/components/NewsletterIssueTile";
import StyledList from "@/components/StyledList";
import PastIssuesList from "@/components/PastIssuesList";
import EmptyIssueSlot from "@/components/EmptyIssueSlot";

export default async function NewsletterIssuesList({
  showPastIssues = true,
}: {
  showPastIssues?: boolean;
}) {
  const newsletterIssues = await getAllNewsletterIssues();

  // Only show an empty issue slot if the number of issues is even
  // ...meaning the list of *past issues* is odd, and needs a spare tile
  const needsEmptyIssueSlot = newsletterIssues.length % 2 === 0;

  // Importing StyledList as a separate, barebones, slightly-styled component to avoid Pigment CSS + Next.js server component boundary issues
  return (
    <>
      <StyledList>
        <section>
          <h2>Latest issue</h2>
          <NewsletterIssueTile
            featured={true}
            slug={newsletterIssues[0].slug}
            title={
              newsletterIssues[0].customMetadata.verboseTitle ??
              newsletterIssues[0].metadata.title
            }
            issueNumber={newsletterIssues[0].customMetadata.issueNumber}
            date={newsletterIssues[0].formattedDate}
            previewImages={newsletterIssues[0].customMetadata.previewImages}
          />
        </section>

        {newsletterIssues.length > 1 && showPastIssues && (
          <section>
            <h2>Past issues</h2>
            <PastIssuesList>
              {newsletterIssues
                .filter((_, index) => index > 0)
                .map(
                  ({
                    slug,
                    metadata: { title },
                    customMetadata: {
                      issueNumber,
                      verboseTitle,
                      previewImages,
                    },
                    formattedDate,
                  }) => (
                    <NewsletterIssueTile
                      key={slug}
                      featured={false}
                      slug={slug}
                      title={verboseTitle ?? title}
                      issueNumber={issueNumber}
                      date={formattedDate}
                      previewImages={previewImages}
                    />
                  )
                )}
              {needsEmptyIssueSlot && <EmptyIssueSlot key="empty-slot" />}
            </PastIssuesList>
          </section>
        )}
      </StyledList>
    </>
  );
}
