// Shared utils between all Markdown collections, like newsletter issues and legal pages
// https://www.notion.so/peels/Markdown-Pages-20bb37e1678f806a9649c3c658ab6258?source=copy_link

import { readdir } from "fs/promises";
import type { Dirent } from "fs";
import { join } from "path";
import { siteConfig } from "@/config/site";
import { formatPublishDate } from "@/utils/dateUtils";

// Common file utilities
export const isMDXFile = (dirent: Dirent) =>
  !dirent.isDirectory() && dirent.name.endsWith(".mdx");

export const getSlugFromFilename = (dirent: Dirent) =>
  dirent.name.substring(0, dirent.name.lastIndexOf("."));

// Common content loading utilities
export async function getAllContentSlugs(
  contentType: "newsletter" | "legal"
): Promise<string[]> {
  try {
    // Get the absolute path to the project root to avoid potential problems with build processes across deployments
    const contentPath = join(process.cwd(), "src", "content", contentType);
    const dirents = await readdir(contentPath, {
      withFileTypes: true,
    });

    return dirents.filter(isMDXFile).map(getSlugFromFilename);
  } catch (error) {
    console.error(`Error reading ${contentType} content:`, error);
    return [];
  }
}

// Common metadata validation
export function validateBaseMetadata(metadata: any, slug: string) {
  if (!metadata?.title || !metadata?.description) {
    throw new Error(`Missing some required metadata fields in: ${slug}`);
  }
}

export function validateNewsletterMetadata(metadata: any, slug: string) {
  validateBaseMetadata(metadata, slug);
  if (!metadata?.authors || !Array.isArray(metadata.authors)) {
    throw new Error(`Missing or invalid authors field in: ${slug}`);
  }
}

export function validateNewsletterCustomMetadata(
  customMetadata: any,
  slug: string
) {
  if (
    !customMetadata?.issueNumber ||
    !customMetadata?.publishDate ||
    (customMetadata.previewImages &&
      !Array.isArray(customMetadata.previewImages))
  ) {
    throw new Error(
      `Missing required newsletter custom metadata fields in: ${slug}`
    );
  }
}

export function validateBaseCustomMetadata(
  customMetadata: any,
  slug: string,
  requiredFields: string[] = []
) {
  if (!customMetadata) return; // Allow for no custom metadata

  for (const field of requiredFields) {
    if (!customMetadata[field]) {
      throw new Error(
        `Missing required custom metadata field, ${field}, in: ${slug}`
      );
    }
  }
}

// Common data formatting
export function formatContentData<
  T extends {
    metadata: { title: string; description: string };
    customMetadata?: { [key: string]: string };
  },
>(
  data: T,
  dateField: string = "publishDate",
  isDateRequired: boolean = true
): T & { formattedDate: string } {
  // Always return string for formattedDate
  if (!data.customMetadata?.[dateField]) {
    if (isDateRequired) {
      throw new Error(`Missing required date field: ${dateField}`);
    }
    return {
      ...data,
      formattedDate: "", // Return empty string instead of undefined
    };
  }

  // Add OpenGraph metadata
  const metadata = {
    ...data,
    formattedDate: formatPublishDate(data.customMetadata[dateField]),
    openGraph: {
      title: data.metadata.title,
      description: data.metadata.description,
      type: "article", // Assuming 'article' since these are all longform text pages
    },
  };

  return metadata;
}
