// https://www.notion.so/peels/Markdown-Pages-20bb37e1678f806a9649c3c658ab6258?source=copy_link
import { Feed } from "feed";
import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import { siteConfig } from "@/config/site";

const feed = new Feed({
    title: `${siteConfig.name}: Newsletter`, // Peels: Newsletter (matches layout.tsx)
    description: siteConfig.newsletter.description,
    id: `${siteConfig.url}/newsletter`,
    link: `${siteConfig.url}/newsletter/feed.xml`,
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
            content:
                `Check this issue out <a href="${issueLink}">on Peels</a>.`,
            date: new Date(issue.customMetadata.publishDate),
        });
    });

    return new Response(feed.rss2(), {
        headers: {
            "Content-Type": "application/rss+xml",
        },
    });
}
