import type { Metadata } from "next";
import { siteConfig } from "../config/site.ts";

const openGraphImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: siteConfig.description,
};

type CreatePeelsMetadataOptions = Omit<
  Metadata,
  "alternates" | "metadataBase" | "openGraph" | "twitter"
> & {
  canonicalPath?: string;
  alternates?: Metadata["alternates"];
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
};

export function getCanonicalUrl(path: string) {
  if (path === "/") {
    return siteConfig.url;
  }

  return new URL(path, siteConfig.url).toString();
}

function getMetadataTitle(title: Metadata["title"]) {
  if (typeof title === "string") {
    return title;
  }

  if (!title || typeof title !== "object") {
    return null;
  }

  if ("absolute" in title && typeof title.absolute === "string") {
    return title.absolute;
  }

  if ("default" in title && typeof title.default === "string") {
    return title.default;
  }

  return null;
}

export function createPeelsMetadata({
  canonicalPath,
  alternates,
  openGraph,
  twitter,
  title,
  description = siteConfig.description,
  ...metadata
}: CreatePeelsMetadataOptions = {}): Metadata {
  const canonicalUrl = canonicalPath
    ? getCanonicalUrl(canonicalPath)
    : undefined;
  const metadataDescription = description ?? siteConfig.description;
  const socialTitle = getMetadataTitle(title) ?? siteConfig.name;
  const openGraphMetadata = openGraph ?? {};
  const twitterMetadata = twitter ?? {};

  return {
    metadataBase: new URL(siteConfig.url),
    description: metadataDescription,
    title,
    ...metadata,
    alternates: {
      ...(canonicalUrl ? { canonical: canonicalUrl } : {}),
      ...alternates,
    },
    openGraph: {
      title: socialTitle,
      type: "website",
      description: metadataDescription,
      siteName: siteConfig.name,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...openGraphMetadata,
      images: openGraphMetadata.images ?? [openGraphImage],
    } as Metadata["openGraph"],
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: metadataDescription,
      ...twitterMetadata,
      images: twitterMetadata.images ?? [openGraphImage],
    },
  };
}

export const noindexFollowMetadata = {
  robots: {
    index: false,
    follow: true,
  },
} satisfies Metadata;
