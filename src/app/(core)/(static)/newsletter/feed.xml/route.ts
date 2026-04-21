// https://www.notion.so/peels/Markdown-Pages-20bb37e1678f806a9649c3c658ab6258?source=copy_link
import { Feed } from "feed";
import { getAllNewsletterIssues } from "@/lib/content/handlers/newsletter";
import { siteConfig } from "@/config/site";
import { getNewsletterIssueImageUrl } from "@/utils/storage";
import { defaultLocale, normaliseLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedLocale = requestUrl.searchParams.get("locale");
  const locale = normaliseLocale(requestedLocale) ?? defaultLocale;
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  const newsletterIssues = await getAllNewsletterIssues(locale);
  const feedUrl = new URL("/newsletter/feed.xml", siteConfig.url);

  if (requestedLocale) {
    feedUrl.searchParams.set("locale", locale);
  }

  const feed = new Feed({
    title: `${siteConfig.name}: ${t("title")}`,
    description: t("description"),
    id: feedUrl.toString(),
    link: feedUrl.toString(),
    favicon: `${siteConfig.url}/favicon.ico`,
    language: locale,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
  });

  newsletterIssues.forEach((issue) => {
    const issueUrl = new URL(`/newsletter/${issue.slug}`, siteConfig.url);
    if (locale !== defaultLocale) {
      issueUrl.searchParams.set("locale", locale);
    }
    const issueLink = issueUrl.toString();
    const issueImage = new URL(
      getNewsletterIssueImageUrl(
        issue.customMetadata.issueNumber,
        issue.customMetadata.ogImage
      ),
      siteConfig.url
    ).toString();
    feed.addItem({
      title: issue.metadata.title,
      link: issueLink,
      description: issue.metadata.description,
      author: issue.metadata.authors.map((author) => ({
        name: author,
      })),
      image: issueImage,
      content: `${
        issue.metadata.description ? `<p>${issue.metadata.description}</p>` : ""
      }<p><a href="${issueLink}">${t("readFullIssue")}</a></p>`,
      date: new Date(issue.customMetadata.publishDate),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
