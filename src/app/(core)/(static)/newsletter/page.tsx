// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import StaticPageHeader from "@/components/StaticPageHeader";
import NewsletterIssueRow from "@/components/NewsletterIssueRow";
import NewsletterCallout from "@/components/NewsletterCallout";
import { siteConfig } from "@/config/site";
import Hyperlink from "@/components/Hyperlink";

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

export default async function NewsletterPage() {
  const newsletterIssues = await getAllNewsletterIssuesData();

  return (
    <>
      <StaticPageHeader
        title="Newsletter"
        subtitle={
          <>
            {siteConfig.newsletter.description}{" "}
            <Hyperlink href={siteConfig.links.join}>Join Peels</Hyperlink> to
            get future issues in your inbox.
          </>
        }
      />
      <h2>Issues</h2>
      {/* TODO: move below to a component that can be reused at bottom of individual newsletter issue pages */}
      <ul>
        {newsletterIssues.map(
          (
            {
              slug,
              metadata: { title },
              customMetadata: { issueNumber, featuredImages },
              formattedDate,
            },
            index
          ) => (
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
      </ul>

      {/* TODO make this section reusable on both layouts */}
      <h2>Get these in your inbox</h2>
      <p>
        Opt-in to receive future issues of the newsletter via email. Or
        subscribe to the{" "}
        <Hyperlink href="/newsletter/feed.xml">RSS feed</Hyperlink>.
      </p>
      <NewsletterCallout />
    </>
  );
}
