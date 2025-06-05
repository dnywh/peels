// See similar newsletter setup for documentation
import dynamic from "next/dynamic";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import { getTextPageMetadata } from "../_lib/getTextPageMetadata";
import { formatPublishDate } from "@/utils/dateUtils";
import { styled } from "@pigment-css/react";
import StaticPageMain from "@/components/StaticPageMain";

export async function generateMetadata({ params }) {
  const { metadata } = await getTextPageMetadata(params.slug);
  return metadata;
}

export async function generateStaticParams() {
  return [{ slug: "colophon" }, { slug: "terms" }, { slug: "privacy" }];
}

export default async function TextPage({ params }) {
  const { slug } = params;
  const { metadata, customMetadata } = await getTextPageMetadata(slug);

  // Set unique inline title if verbose title passed through (assuming customMetadata has even been provided)
  // E.g. 'Privacy' in <title>, 'Privacy policy' on inline <h1>
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
    <StaticPageMain>
      <div>
        <StaticPageHeader title={pageTitle} subtitle={pageDescription} />
        <LongformTextContainer>
          <TextPageMarkdown />
        </LongformTextContainer>
      </div>
    </StaticPageMain>
  );
}
