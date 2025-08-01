// https://www.notion.so/peels/Markdown-Pages-20bb37e1678f806a9649c3c658ab6258?source=copy_link
import { Feed } from "feed";
import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static"; // Force as prerendered static content on build, not dynamic (otherwise issues don't populate)

const feed = new Feed({
  title: `${siteConfig.name}: Newsletter`, // Peels: Newsletter (matches layout.tsx)
  description: siteConfig.newsletter.description,
  id: `${siteConfig.url}/newsletter`,
  link: `${siteConfig.url}/newsletter/feed.xml`,
  favicon: `${siteConfig.url}/favicon.ico`,
  language: "en",
  copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
});

export async function GET() {
  const newsletterIssues = await getAllNewsletterIssues();

  newsletterIssues.forEach((issue) => {
    const issueLink = `${siteConfig.url}/newsletter/${issue.slug}`;
    feed.addItem({
      title: issue.metadata.title,
      link: `${siteConfig.url}/newsletter/${issue.slug}`,
      description: issue.metadata.description,
      author: issue.metadata.authors.map((author) => ({
        name: author,
      })),
      image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static/newsletter/${issue.customMetadata.issueNumber}/${issue.customMetadata.ogImage}`,
      content: `${
        issue.metadata.description ? `<p>${issue.metadata.description}</p>` : ""
      }<p><a href="${issueLink}">Read this full issue on Peels</a></p>`,
      date: new Date(issue.customMetadata.publishDate),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
    },
  });
}
