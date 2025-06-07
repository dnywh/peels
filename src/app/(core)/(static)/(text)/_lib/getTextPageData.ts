// For documentation, see analagous setup for newsletter issues
import type { Metadata } from "next/types";
import { notFound } from "next/navigation";
import { formatPublishDate } from "@/utils/dateUtils";

export type PageMetadata = Metadata & {
    title: string;
    description: string;
};

export type CustomMetadata = {
    verboseTitle: string;
    updatedDate: string;
};

export type TextPageData = {
    slug: string;
    metadata: PageMetadata;
    customMetadata?: CustomMetadata;
    formattedDate?: string;
};

export async function getTextPageMetadata(
    slug: string,
): Promise<TextPageData> {
    try {
        const file = await import(`../content/${slug}.mdx`);

        if (file?.metadata) {
            if (
                !file.metadata.title || !file.metadata.description
            ) {
                throw new Error(
                    `Missing some required metadata fields in: ${slug}`,
                );
            }

            const result: TextPageData = {
                slug,
                metadata: file.metadata,
            };

            // Only add customMetadata if the page has it
            if (file.customMetadata) {
                result.customMetadata = file.customMetadata;

                // Only add formattedDate if customMetadata includes an updatedDate property
                if (file.customMetadata.updatedDate) {
                    result.formattedDate = formatPublishDate(
                        file.customMetadata.updatedDate,
                    );
                }
            }

            return result;
        } else {
            throw new Error(`Unable to find metadata for ${slug}.mdx`);
        }
    } catch (error: any) {
        console.error(error?.message);
        return notFound();
    }
}
