import { notFound } from "next/navigation";
import { cache } from "react";
import type { LegalPageData } from "../types";
import {
  formatContentData,
  importLocalizedContentModule,
  resolveContentLocale,
  validateBaseCustomMetadata,
  validateBaseMetadata,
} from "../utils";

export const getLegalPageMetadata = cache(async function getLegalPageMetadata(
  slug: string,
  locale: string | null | undefined = null
): Promise<LegalPageData> {
  try {
    const resolvedLocale = resolveContentLocale(locale);
    const content = await importLocalizedContentModule(
      "legal",
      slug,
      resolvedLocale
    );
    const file = content.file;

    if (file?.metadata) {
      validateBaseMetadata(file.metadata, slug);

      // Only validate customMetadata if it exists
      if (file.customMetadata) {
        validateBaseCustomMetadata(file.customMetadata, slug, ["updatedDate"]);
      }

      return formatContentData(
        {
          slug,
          metadata: file.metadata,
          customMetadata: file.customMetadata,
          locale: content.locale,
          isFallback: content.isFallback,
        },
        resolvedLocale,
        "updatedDate",
        false // updatedDate is optional for legal pages
      );
    }

    throw new Error(`Unable to find metadata for ${slug}.mdx`);
  } catch (error: any) {
    console.error(error?.message);
    return notFound();
  }
});

export const getLegalPageModule = cache(async function getLegalPageModule(
  slug: string,
  locale: string | null | undefined = null
) {
  const resolvedLocale = resolveContentLocale(locale);
  return importLocalizedContentModule("legal", slug, resolvedLocale);
});
