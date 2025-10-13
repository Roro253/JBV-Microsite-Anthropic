import type { Metadata } from "next";

import { ThemeColorScript } from "@/app/theme-script";
import { LeftRailWatchlist, WatchlistPanePills } from "@/components/LeftRailWatchlist";

import { geistMono, geistSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anthropic — JBV Capital Microsite",
  description:
    "JBV Capital's investor-grade perspective on Anthropic's safety-first execution and frontier AI growth."
};

export default function RootLayout({
  children,
  pane
}: Readonly<{
  children: React.ReactNode;
  pane: React.ReactNode;
}>) {
  return (
    <html lang="en" data-mode="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 font-sans antialiased`}
      >
        <ThemeColorScript />
        <div className="relative flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-[84px] shrink-0 items-start justify-center px-3 pt-6 md:flex lg:w-[104px]">
            <LeftRailWatchlist />
          </aside>
          <div className="relative flex min-h-screen flex-1 flex-col">
            <div className="px-4 pb-2 pt-4 md:hidden">
              <WatchlistPanePills />
            </div>
            {children}
          </div>
          {pane ? <div className="hidden">{pane}</div> : null}
        </div>
      </body>
    </html>
  );
}
