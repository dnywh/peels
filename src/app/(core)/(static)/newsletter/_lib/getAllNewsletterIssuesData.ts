// https://didoesdigital.com/blog/nextjs-blog-06-metadata-and-navigation/
// https://didoesdigital.com/blog/nextjs-blog-09-rss/
import type { Dirent } from "fs";

const isMDXFile = (dirent: Dirent) =>
    !dirent.isDirectory() && dirent.name.endsWith(".mdx");

const getSlugFromFilename = (dirent: Dirent) =>
    dirent.name.substring(0, dirent.name.lastIndexOf("."));

import { readdir } from "fs/promises";
import { getNewsletterIssueMetadata } from "@/app/(core)/(static)/newsletter/_lib/getNewsletterIssueData";
import type { NewsletterIssueData } from "@/app/(core)/(static)/newsletter/_lib/getNewsletterIssueData";

export async function getAllNewsletterIssuesData(): Promise<
    NewsletterIssueData[]
> {
    try {
        const dirents = await readdir("./src/newsletter/", {
            withFileTypes: true,
        });

        const slugs = dirents.filter(isMDXFile).map(getSlugFromFilename);

        const result = await Promise.all(
            slugs.map((slug) => {
                return getNewsletterIssueMetadata(slug);
            }),
        );

        result.sort(
            (a, b) =>
                +new Date(b.customMetadata.publishDate) -
                +new Date(a.customMetadata.publishDate),
        );

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
