import { Public_Sans } from "next/font/google";
import "@pigment-css/react/styles.css";
import "./globals.css";

import Link from "next/link";
import { Metadata } from "next";
import { getBaseUrl } from "@/utils/url";
import { siteConfig } from "@/config/site";

import { globalCss, styled } from "@pigment-css/react";
import type { ExtendTheme } from "@pigment-css/react/theme";

const publicSans = Public_Sans({
  display: "swap",
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

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

// Global styles:
globalCss`
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
p {
  text-wrap: pretty;
}
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
a:not(p a) {
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
`;

const Body = styled("body")(({ theme }) => ({
  backgroundColor: theme.colors.background.sunk,

  // Prepare for bottom tab bar across all possible pages
  // paddingBottom: "5rem",
  // Turned off because it messes with pages that use the full height of the screen, e.g. chats
  "@media (min-width: 768px)": {
    paddingBottom: "0",
  },
}));

export const metadata: Metadata = {
  // Force the Peels URL (NEXT_PUBLIC_APP_URL) instead of what might render as a preview deployment URL (VERCEL_URL)
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "food waste",
    "food scraps",
    "share waste",
    "sharewaste",
    "makesoil",
    "compost near me",
    "food scrap drop-off",
  ],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Re-add suppressHydrationWarning? What was it in for?
    <html lang="en" className={publicSans.className}>
      <Body>{children}</Body>
    </html>
  );
}
