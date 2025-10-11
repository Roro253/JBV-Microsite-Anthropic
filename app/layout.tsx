import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ThemeColorScript } from "@/app/theme-script";
import { Providers } from "@/app/providers";
import { getAnthropicData } from "@/lib/data";
import { ModeWatcher } from "@/components/ModeWatcher";
import { SeoProvider } from "@/components/SeoProvider";
import { AnalyticsToggle } from "@/components/AnalyticsToggle";
import { CookieNotice } from "@/components/CookieNotice";

import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthropic — JBV Capital Microsite",
  description:
    "JBV Capital's investor-grade perspective on Anthropic's safety-first execution and frontier AI growth."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = getAnthropicData();

  return (
    <html lang="en" data-mode="light">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeColorScript />
        <ModeWatcher />
        <SeoProvider data={data} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sky-500 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <Providers>
            <main id="main-content" className="flex flex-1 flex-col">
              {children}
            </main>
          </Providers>
          <Footer
            className="mt-auto lg:sticky lg:bottom-0"
            lastUpdated={data.last_updated}
          />
        </div>
        <AnalyticsToggle />
        <CookieNotice />
      </body>
    </html>
  );
}
