import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Metadata } from 'next'
import { getBaseUrl } from "@/utils/url";
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // ... other metadata
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>{siteConfig.name}</Link>
                    <div className="flex items-center gap-2">
                      <Link href={"/map"}>Map</Link>
                      <Link href={"/chats"}>Chats</Link>
                      <Link href={"/profile"}>Profile</Link>
                    </div>
                  </div>
          
                </div>
              </nav>
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>

              {/* Shared footer  */}
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
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
