import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { cookies, headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Metadata } from "next";
import { getBaseUrl } from "@/utils/url";
import { siteConfig } from "@/config/site";

import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";
import { globalCss, styled } from "@pigment-css/react";
import type { ExtendTheme } from "@pigment-css/react/theme";
import "@pigment-css/react/styles.css";

import { UnreadMessagesProvider } from "@/contexts/UnreadMessagesContext";
import AttributionCapture from "@/components/AttributionCapture";

declare module "@pigment-css/react/theme" {
  interface ThemeTokens {
    // the structure of your theme
  }

  interface ThemeArgs {
    theme: ExtendTheme<{
      colorScheme: "light" | "dark";
      tokens: ThemeTokens;
    }>;
  }
}

const staticAssetUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static`;

// Global styles:
globalCss`
// National 2 font
  @font-face {
    font-family: 'National 2';
    src: url(${staticAssetUrl}/fonts/national-2-regular-subset.woff2) format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'National 2';
    src: url(${staticAssetUrl}/fonts/national-2-medium-subset.woff2) format('woff2');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'National 2';
    src: url(${staticAssetUrl}/fonts/national-2-bold-subset.woff2) format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }

    // Apply the font family to all elements
  * {
    font-family: 'National 2', system-ui, -apple-system, sans-serif;
  }

  * {
  // Normalize quotes and apostrophes
  text-rendering: optimizeLegibility;
  font-feature-settings: "kern", "liga", "clig", "calt", "quot", "apos";
  // The below two features are already set in the above feature-settings but are made explicit again, below
  font-variant-ligatures: common-ligatures;
  font-variant-numeric: oldstyle-nums;
}
  


// https://www.joshwcomeau.com/css/custom-css-reset/

/* 1. Use a more-intuitive box-sizing model */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 2. Remove default margin */
* {
  margin: 0;
}

body {
  /* 3. Add accessible line-height */
  line-height: 1.5;
  /* 4. Improve text rendering */
  -webkit-font-smoothing: antialiased;
}

/* 5. Improve media defaults */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

/* 6. Inherit fonts for form controls */
input, button, textarea, select {
  font: inherit;
}

/* 7. Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* 8. Improve line wrapping */
// p {
//   text-wrap: pretty;
// }
h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}


/*
  9. Create a root stacking context
*/
// #root, #__next {
//   isolation: isolate;
// }

// Custom styles
// Remove underlines by default, except for links in paragraphs
a:not(p a, figcaption a) {
  text-decoration: none;
}

a:visited {
  color: inherit;
}

ul, ol {
  list-style: none;
  margin: 0;
  padding: 0;
}

fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

// Lazy letter-spacing fix
* {
  letter-spacing: -0.015em
}

// Allow animating things like details summary
// https://youtu.be/Vzj3jSUbMtI?si=3xNf56u0E29aNjhr&t=219
// https://www.joshwcomeau.com/email/2025-03-24-animating-height-auto/
:root {
  interpolate-size: allow-keywords;
}

html {
  // Smooth scrolling everywhere
  scroll-behavior: smooth;
  // Animate height, like on FAQ accordions
}
`;

const Body = styled("body")(({ theme }) => ({
  backgroundColor: theme.colors.background.sunk,
}));

export const metadata: Metadata = {
  // Force the Peels URL (siteConfig.url) instead of what might render as a preview deployment URL (VERCEL_URL)
  // Might be related to local-only build issue: metadataBase property in metadata export is not set for resolving social open graph or twitter images, using "https://www.peels.app". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`, // E.g. "Page title here · Peels"
  },
  description: siteConfig.description,
  keywords: [...siteConfig.meta.keywords],
  openGraph: {
    title: siteConfig.name,
    type: "website",
    description: siteConfig.description,
    siteName: siteConfig.name,
    // url: siteConfig.url, // Should be the canonical URL of your object, not site root URL
  },
  // RSS feed for newsletter
  // https://didoesdigital.com/blog/nextjs-blog-09-rss/
  alternates: {
    types: {
      "application/rss+xml": [
        {
          title: `${siteConfig.name}: Newsletter`, // Peels: Newsletter (matches route.ts)
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

  return (
    <html lang={locale}>
      <Body>
        <AttributionCapture />
        <NextIntlClientProvider>
          <UnreadMessagesProvider>{children}</UnreadMessagesProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </Body>
    </html>
  );
}
