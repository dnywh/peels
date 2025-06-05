// See similar newsletter setup for documentation
export async function getTextPageMetadata(slug) {
    const { metadata, customMetadata } = await import(`../content/${slug}.mdx`);
    return { metadata, customMetadata };
}
