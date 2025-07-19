import { notFound } from "next/navigation";
import type { NewsletterIssueData } from "../types";
import {
  formatContentData,
  getAllContentSlugs,
  validateNewsletterCustomMetadata,
  validateNewsletterMetadata,
} from "../utils";

export async function getNewsletterIssueMetadata(
  slug: string
): Promise<NewsletterIssueData> {
  try {
    const file = await import(`@/content/newsletter/${slug}.mdx`);

    if (file?.metadata && file?.customMetadata) {
      validateNewsletterMetadata(file.metadata, slug);
      validateNewsletterCustomMetadata(file.customMetadata, slug);

      return formatContentData(
        {
          slug,
          metadata: file.metadata,
          customMetadata: file.customMetadata,
        },
        "publishDate",
        true // publishDate is required for legal pages
      );
    }

    throw new Error(`Unable to find metadata for ${slug}.mdx`);
  } catch (error: any) {
    console.error(error?.message);
    return notFound();
  }
}

export async function getAllNewsletterIssues(): Promise<NewsletterIssueData[]> {
  const slugs = await getAllContentSlugs("newsletter");
  const issues = await Promise.all(
    slugs.map((slug) => getNewsletterIssueMetadata(slug))
  );

  return issues.sort(
    (a, b) =>
      +new Date(b.customMetadata.publishDate) -
      +new Date(a.customMetadata.publishDate)
  );
}
