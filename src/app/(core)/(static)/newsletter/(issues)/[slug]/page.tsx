import Link from "next/link";
import type { Metadata } from "next/types";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import LongformTextContainer from "@/components/LongformTextContainer";
import NewsletterCallout from "@/components/NewsletterCallout";
import { siteConfig } from "@/config/site";
import { getAllContentSlugs } from "@/lib/content/utils";
import {
  getNewsletterIssueMetadata,
  getNewsletterIssueModule,
} from "@/lib/content/handlers/newsletter";
import StaticPageSection from "@/components/StaticPageSection";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import { getNewsletterIssueImageUrl } from "@/utils/storage";
import TranslationNotice from "@/components/TranslationNotice";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocaleFromSearchParams } from "@/utils/authRedirects";
import { defaultLocale } from "@/i18n/config";

type NewsletterIssuePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ locale?: string | string[] | undefined }>;
};

const resolveNewsletterIssueLocale = async (
  searchParams: NewsletterIssuePageProps["searchParams"]
) => {
  const requestedLocale = getLocaleFromSearchParams(await searchParams);

  return requestedLocale ?? (await getLocale());
};

export async function generateMetadata({
  params,
  searchParams,
}: NewsletterIssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveNewsletterIssueLocale(searchParams);
  const { metadata, customMetadata } = await getNewsletterIssueMetadata(
    slug,
    locale
  );

  if (metadata) {
    return {
      ...metadata,
      openGraph: {
        ...metadata.openGraph,
        images: [
          {
            url: getNewsletterIssueImageUrl(
              customMetadata.issueNumber,
              customMetadata.ogImage
            ),
          },
        ],
        type: "article",
        authors: metadata.authors,
      },
    };
  } else {
    throw new Error(`No metadata found for newsletter issue: ${slug}`);
  }
}

export async function generateStaticParams() {
  const slugs = await getAllContentSlugs("newsletter");
  return slugs.map((slug) => ({ slug }));
}

export default async function NewsletterIssuePage({
  params,
  searchParams,
}: NewsletterIssuePageProps) {
  const { slug } = await params;
  const locale = await resolveNewsletterIssueLocale(searchParams);
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  const rssHref =
    locale === defaultLocale
      ? "/newsletter/feed.xml"
      : `/newsletter/feed.xml?locale=${locale}`;
  const { metadata, customMetadata, formattedDate } =
    await getNewsletterIssueMetadata(slug, locale);
  const title = customMetadata.verboseTitle
    ? customMetadata.verboseTitle
    : metadata.title;
  const issueNumber = customMetadata.issueNumber;
  const {
    file: { default: NewsletterIssueMarkdown },
    isFallback,
  } = await getNewsletterIssueModule(slug, locale);

  return (
    <StaticPageMain>
      <section>
        <StaticPageHeader
          title={title}
          subtitle={t("issueSubtitle", {
            number: issueNumber,
            date: formattedDate,
          })}
          parent={t("parent")}
        />
        <LongformTextContainer>
          {isFallback && (
            <TranslationNotice
              title={t("fallbackTitle")}
              body={t("fallbackBody")}
            />
          )}
          <NewsletterIssueMarkdown />
        </LongformTextContainer>
      </section>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("inboxTitle")}</h2>
          <p>{t("description")}</p>
        </HeaderBlock>
        <NewsletterCallout />
        <FooterBlock>
          <p>
            {t.rich("rss", {
              link: (chunks) => <Link href={rssHref}>{chunks}</Link>,
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StaticPageMain>
  );
}
