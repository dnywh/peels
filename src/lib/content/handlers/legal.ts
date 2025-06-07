import { notFound } from "next/navigation";
import type { LegalPageData } from "../types";
import {
    formatContentData,
    validateBaseCustomMetadata,
    validateBaseMetadata,
} from "../utils";

export async function getLegalPageMetadata(
    slug: string,
): Promise<LegalPageData> {
    try {
        const file = await import(`@/content/legal/${slug}.mdx`);

        if (file?.metadata) {
            validateBaseMetadata(file.metadata, slug);

            // Only validate customMetadata if it exists
            if (file.customMetadata) {
                validateBaseCustomMetadata(file.customMetadata, slug, [
                    "updatedDate",
                ]);
            }

            return formatContentData(
                {
                    slug,
                    metadata: file.metadata,
                    customMetadata: file.customMetadata,
                },
                "updatedDate",
                false, // updatedDate is optional for legal pages
            );
        }

        throw new Error(`Unable to find metadata for ${slug}.mdx`);
    } catch (error: any) {
        console.error(error?.message);
        return notFound();
    }
}
