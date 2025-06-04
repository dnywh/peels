// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
import StaticPageHeader from "@/components/StaticPageHeader";
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
      <ul>
        {newsletterIssues.map(
          ({ slug, metadata: { title }, customMetadata: { issueNumber } }) => (
            <li key={slug}>
              <p>ISSUE #{issueNumber}</p>
              <p>
                <Hyperlink prefetch={false} href={`/newsletter/${slug}`}>
                  {`${title}`}
                </Hyperlink>
              </p>
            </li>
          )
        )}
      </ul>

      <NewsletterCallout />
    </>
  );
}
