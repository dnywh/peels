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
    // favicon: "http://example.com/favicon.ico", TODO
    language: "en",
    copyright: `All rights reserved ${
        new Date().getFullYear()
    }, ${siteConfig.name}`,
});

export async function GET() {
    const newsletterIssues = await getAllNewsletterIssues();
    // console.log(newsletterIssues);

    newsletterIssues.forEach((issue) => {
        const issueLink = `${siteConfig.url}/newsletter/${issue.slug}`;
        feed.addItem({
            title: `${issue.metadata.title ?? ""}`,
            link: `${siteConfig.url}/newsletter/${issue.slug}`,
            description: `${issue.metadata.description ?? ""}`,
            // author: {issue.metadata.authors ? issue.metadata.authors : "Peels"}  TODO
            // image: {issues.customMetadata.featuredImages[0]} TODO
            content: `${
                issue.metadata.description
                    ? `<p>${issue.metadata.description}</p>`
                    : ""
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
