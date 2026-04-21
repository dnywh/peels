import { notFound } from "next/navigation";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import type { NewsletterIssueData } from "../types";
import {
  formatContentData,
  getAllContentSlugs,
  importLocalizedContentModule,
  resolveContentLocale,
  validateNewsletterCustomMetadata,
  validateNewsletterMetadata,
} from "../utils";

export const getNewsletterIssueMetadata = cache(
  async function getNewsletterIssueMetadata(
    slug: string,
    locale: string | null | undefined = null
  ): Promise<NewsletterIssueData> {
    try {
      const resolvedLocale = resolveContentLocale(locale);
      const content = await importLocalizedContentModule(
        "newsletter",
        slug,
        resolvedLocale
      );
      const file = content.file;

      if (file?.metadata && file?.customMetadata) {
        validateNewsletterMetadata(file.metadata, slug);
        validateNewsletterCustomMetadata(file.customMetadata, slug);

        return formatContentData(
          {
            slug,
            metadata: file.metadata,
            customMetadata: file.customMetadata,
            locale: content.locale,
            isFallback: content.isFallback,
          },
          resolvedLocale,
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
);

export const getNewsletterIssueModule = cache(
  async function getNewsletterIssueModule(
    slug: string,
    locale: string | null | undefined = null
  ) {
    const resolvedLocale = resolveContentLocale(locale);
    return importLocalizedContentModule("newsletter", slug, resolvedLocale);
  }
);

export async function getAllNewsletterIssues(
  locale: string | null | undefined = null
): Promise<NewsletterIssueData[]> {
  const resolvedLocale = resolveContentLocale(locale);
  const slugs = await getAllContentSlugs("newsletter");
  const issues = await Promise.all(
    slugs.map((slug) => getNewsletterIssueMetadata(slug, resolvedLocale))
  );

  return issues.sort(
    (a, b) =>
      +new Date(b.customMetadata.publishDate) -
      +new Date(a.customMetadata.publishDate)
  );
}
