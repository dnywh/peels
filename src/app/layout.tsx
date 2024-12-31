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
// globalCss`
//   body {
//   background-color: #ffffff;
//   }
// `;
// Template syntax:
// const bodyBackground = css`
//   background-color: red;
//   color: white;
// `;
// Object syntax
// const bodyBackground = css({
//   backgroundColor: "#f0f0f0",
//   color: "red",
// });

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
          <main>
            <nav>
              <Link href={"/"}>{siteConfig.name}</Link>

              <Link href={"/map"}>Map</Link>
              <Link href={"/chats"}>Chats</Link>
              <Link href={"/profile"}>Profile</Link>

              <NavWrapper />
            </nav>

            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
