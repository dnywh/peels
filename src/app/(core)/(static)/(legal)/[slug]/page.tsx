// For documentation, see analagous setup for newsletter issues
import dynamic from "next/dynamic";
import type { Metadata } from "next/types";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import { getAllContentSlugs } from "@/lib/content/utils";
import { getLegalPageMetadata } from "@/lib/content/handlers/legal";
import { formatPublishDate } from "@/utils/dateUtils";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await getLegalPageMetadata(slug);

  if (metadata) {
    return {
      ...metadata,
      openGraph: {
        ...metadata.openGraph,
        type: "article",
      },
    };
  } else {
    throw new Error(`No metadata found for text page: ${slug}`);
  }
}

export async function generateStaticParams() {
  const slugs = await getAllContentSlugs("legal");
  return slugs.map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const { metadata, customMetadata } = await getLegalPageMetadata(slug);

  // Set unique inline title if verbose title passed through (assuming customMetadata has even been provided)
  // E.g. 'Privacy' in the <title> and 'Privacy policy' in the inline <h1>
  const pageTitle = customMetadata
    ? customMetadata.verboseTitle
      ? customMetadata.verboseTitle
      : metadata.title
    : metadata.title;

  // Set description to last updated date, if provided
  // TODO: Any way to use this in OG metadata?
  //   TODO use consistent date formatting here, chat messages (maybe), and newsletter issues
  const pageDescription = customMetadata
    ? customMetadata.updatedDate
      ? `Last updated ${formatPublishDate(customMetadata.updatedDate)}`
      : metadata.description
    : metadata.description;

  //   Dynamically import MDX files
  const LegalPageMarkdown = dynamic(
    () => import(`@/content/legal/${slug}.mdx`)
  );

  return (
    // // Largely matches newsletter/(issues) page.tsx
    <StaticPageMain>
      {/* Nest header and main content together so they visually hug */}
      <section>
        <StaticPageHeader title={pageTitle} subtitle={pageDescription} />
        <LongformTextContainer>
          <LegalPageMarkdown />
        </LongformTextContainer>
      </section>
    </StaticPageMain>
  );
}
