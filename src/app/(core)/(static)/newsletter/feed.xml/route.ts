// https://didoesdigital.com/blog/nextjs-blog-09-rss/
import { Feed } from "feed";
import { getAllNewsletterIssuesData } from "@/app/(core)/(static)/newsletter/_lib/getAllNewsletterIssuesData";
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
    const newsletterIssues = await getAllNewsletterIssuesData();

    newsletterIssues.forEach((issue) => {
        feed.addItem({
            title: `${issue.metadata.title ?? ""}`,
            link: `https://example.com/blog/${issue.slug}`,
            description: `${issue.metadata.description ?? ""}`,
            // content: issue.children,
            date: new Date(issue.customMetadata.publishDate), // TODO: set this to the issue's publish date
        });
    });

    return new Response(feed.rss2(), {
        headers: {
            "Content-Type": "application/rss+xml",
        },
    });
}
