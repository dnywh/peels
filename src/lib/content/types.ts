// Shared types between all Markdown collections, like newsletter issues and legal pages
// https://www.notion.so/peels/Markdown-Pages-20bb37e1678f806a9649c3c658ab6258?source=copy_link

import type { Metadata } from "next/types";

// Base metadata that all content types share
export type BaseMetadata = Metadata & {
    title: string;
    description: string;
};

// Newsletter-specific metadata
export type NewsletterMetadata = BaseMetadata & {
    authors: Array<string>;
};

// Base custom metadata that all content types share
export type BaseCustomMetadata = Record<string, never>;

// Newsletter-specific types
export type NewsletterCustomMetadata = BaseCustomMetadata & {
    issueNumber: number;
    verboseTitle: string;
    ogImage: string;
    previewImages: Array<string>;
    publishDate: string;
};

export type NewsletterIssueData = {
    slug: string;
    metadata: NewsletterMetadata;
    customMetadata: NewsletterCustomMetadata;
    formattedDate: string;
};

// Legal-specific types
export type LegalCustomMetadata = BaseCustomMetadata & {
    verboseTitle?: string;
    updatedDate?: string;
};

export type LegalPageData = {
    slug: string;
    metadata: BaseMetadata;
    customMetadata?: LegalCustomMetadata;
    formattedDate?: string;
};
