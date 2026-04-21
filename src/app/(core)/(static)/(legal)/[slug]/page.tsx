// For documentation, see analogous setup for newsletter issues
import type { Metadata } from "next/types";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import TranslationNotice from "@/components/TranslationNotice";
import { getAllContentSlugs } from "@/lib/content/utils";
import {
  getLegalPageMetadata,
  getLegalPageModule,
} from "@/lib/content/handlers/legal";
import { getLocale, getTranslations } from "next-intl/server";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const { metadata } = await getLegalPageMetadata(slug, locale);

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
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Legal" });
  const { metadata, customMetadata, formattedDate } =
    await getLegalPageMetadata(slug, locale);
  const {
    file: { default: LegalPageMarkdown },
    isFallback,
  } = await getLegalPageModule(slug, locale);

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
  const pageDescription =
    customMetadata?.updatedDate && formattedDate
      ? t("lastUpdated", { date: formattedDate })
      : metadata.description;

  return (
    // // Largely matches newsletter/(issues) page.tsx
    <StaticPageMain>
      {/* Nest header and main content together so they visually hug */}
      <section>
        <StaticPageHeader title={pageTitle} subtitle={pageDescription} />
        <LongformTextContainer>
          {isFallback && (
            <TranslationNotice
              title={t("fallbackTitle")}
              body={t("fallbackBody")}
            />
          )}
          <LegalPageMarkdown />
        </LongformTextContainer>
      </section>
    </StaticPageMain>
  );
}
