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
  body {
  // text-decoration: underline;
  }
`;
// Template syntax:
const bodyBackground = css`
  background-color: red;
  color: white;
`;
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
            <div>
              <nav>
                <div>
                  <div>
                    <Link href={"/"}>{siteConfig.name}</Link>
                    <div>
                      <Link href={"/map"}>Map</Link>
                      <Link href={"/chats"}>Chats</Link>
                      <Link href={"/profile"}>Profile</Link>
                    </div>
                  </div>
                  <NavWrapper />
                </div>
              </nav>
              <div>{children}</div>

              {/* Shared footer  */}
              <footer>
                <div>© 2024 {siteConfig.name}</div>
                <Link href={siteConfig.links.terms}>Terms</Link>
                <Link href={siteConfig.links.privacy}>Privacy</Link>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
