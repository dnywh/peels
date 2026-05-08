import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getStaticFontUrl } from "@/utils/storage";

import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import "./theme.css";

import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import AttributionCapture from "@/components/AttributionCapture";
import AuthHashCompletion from "@/components/AuthHashCompletion";
import JsonLd from "@/components/JsonLd";

const regularFontUrl = getStaticFontUrl("national-2-regular-subset.woff2");
const mediumFontUrl = getStaticFontUrl("national-2-medium-subset.woff2");
const boldFontUrl = getStaticFontUrl("national-2-bold-subset.woff2");
const hostedFontFaces = `
  @font-face {
    font-family: 'National 2';
    src: url(${regularFontUrl}) format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'National 2';
    src: url(${mediumFontUrl}) format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'National 2';
    src: url(${boldFontUrl}) format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
`;

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: "Peels.app",
    url: siteConfig.url,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.meta.keywords],
  openGraph: {
    title: siteConfig.name,
    type: "website",
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  alternates: {
    types: {
      "application/rss+xml": [
        {
          title: `${siteConfig.name}: Newsletter`,
          url: `${siteConfig.url}/newsletter/feed.xml`,
        },
      ],
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const inlineFontFaces = hostedFontFaces.trim();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <JsonLd data={siteJsonLd} />
        {inlineFontFaces ? <style>{inlineFontFaces}</style> : null}
        <AuthHashCompletion />
        <AttributionCapture />
        <NextIntlClientProvider>
          <UnreadMessagesProvider>{children}</UnreadMessagesProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
