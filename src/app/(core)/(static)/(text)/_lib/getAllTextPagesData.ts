// For documentation, see analagous setup for newsletter issues
import type { Dirent } from "fs";

const isMDXFile = (dirent: Dirent) =>
    !dirent.isDirectory() && dirent.name.endsWith(".mdx");

const getSlugFromFilename = (dirent: Dirent) =>
    dirent.name.substring(0, dirent.name.lastIndexOf("."));

import { readdir } from "fs/promises";
import { getTextPageMetadata } from "@/app/(core)/(static)/(text)/_lib/getTextPageData";
import type { TextPageData } from "@/app/(core)/(static)/(text)/_lib/getTextPageData";

export async function getAllTextPagesData(): Promise<
    TextPageData[]
> {
    try {
        const dirents = await readdir(
            "./src/app/(core)/(static)/(text)/content/",
            {
                withFileTypes: true,
            },
        );

        const slugs = dirents.filter(isMDXFile).map(getSlugFromFilename);

        const result = await Promise.all(
            slugs.map((slug) => {
                return getTextPageMetadata(slug);
            }),
        );

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }
}
