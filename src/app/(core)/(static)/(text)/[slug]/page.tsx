// For documentation, see analagous setup for newsletter issues
import dynamic from "next/dynamic";
import type { Metadata } from "next/types";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import { getAllTextPagesData } from "@/app/(core)/(static)/(text)/_lib/getAllTextPagesData";
import { getTextPageMetadata } from "@/app/(core)/(static)/(text)/_lib/getTextPageData";
import { formatPublishDate } from "@/utils/dateUtils";

type TextPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TextPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { metadata } = await getTextPageMetadata(slug);

  if (metadata) {
    return metadata;
  } else {
    throw new Error(`No metadata found for text page: ${slug}`);
  }
}

export async function generateStaticParams() {
  const textPages = await getAllTextPagesData();
  const textPagesStaticParams = textPages.map((page) => ({
    slug: page.slug,
  }));

  return textPagesStaticParams;
}

export default async function TextPage({ params }: TextPageProps) {
  const { slug } = await params;
  const { metadata, customMetadata } = await getTextPageMetadata(slug);

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
  const TextPageMarkdown = dynamic(() => import(`../content/${slug}.mdx`));

  return (
    // // Largely matches newsletter/(issues) page.tsx
    <StaticPageMain>
      {/* Wrap header and main content in plain section so they visually hug */}
      <section>
        <StaticPageHeader title={pageTitle} subtitle={pageDescription} />
        <LongformTextContainer>
          <TextPageMarkdown />
        </LongformTextContainer>
      </section>
    </StaticPageMain>
  );
}
