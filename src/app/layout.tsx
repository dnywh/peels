import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "@pigment-css/react/styles.css";
import "./globals.css";

import Link from "next/link";
import { Metadata } from "next";
import { getBaseUrl } from "@/utils/url";
import { siteConfig } from "@/config/site";
import { NavWrapper } from "@/components/nav-wrapper";

import { globalCss, css } from "@pigment-css/react";
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
#root, #__next {
  isolation: isolate;
}
`;

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <nav>
              <Link href={"/"}>{siteConfig.name}</Link>

              <Link href={"/map"}>Map</Link>
              <Link href={"/chats"}>Chats</Link>
              <Link href={"/profile"}>Profile</Link>

              <NavWrapper />
            </nav> */}

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
