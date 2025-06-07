// https://didoesdigital.com/blog/nextjs-blog-02-add-mdx/
// https://didoesdigital.com/blog/nextjs-blog-09-rss/
import type { Metadata } from "next/types";
import { notFound } from "next/navigation";
import { formatPublishDate } from "@/utils/dateUtils";

export type IssueMetadata = Metadata & {
    title: string;
    description: string;
    authors: Array<string>;
};

export type CustomMetadata = {
    publishDate: string;
    issueNumber: number;
    featuredImages: Array<string>;
};

export type NewsletterIssueData = {
    slug: string;
    metadata: IssueMetadata;
    customMetadata: CustomMetadata;
    formattedDate: string;
};

export async function getNewsletterIssueMetadata(
    slug: string,
): Promise<NewsletterIssueData> {
    try {
        const file = await import(`@/newsletter/${slug}.mdx`);

        if (file?.metadata && file?.customMetadata) {
            if (
                !file.metadata.title || !file.metadata.description ||
                !file.metadata.authors
            ) {
                throw new Error(
                    `Missing some required metadata fields in: ${slug}`,
                );
            }

            if (!file.customMetadata.publishDate) {
                throw new Error(
                    `Missing required custom metadata field, publishDate, in: ${slug}`,
                );
            }

            return {
                slug,
                metadata: file.metadata,
                customMetadata: file.customMetadata,
                formattedDate: formatPublishDate(
                    file.customMetadata.publishDate,
                ),
            };
        } else {
            throw new Error(`Unable to find metadata for ${slug}.mdx`);
        }
    } catch (error: any) {
        console.error(error?.message);
        return notFound();
    }
}
