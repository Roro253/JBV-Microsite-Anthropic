import { Suspense } from "react";
import type { Metadata } from "next";

import { ThemeColorScript } from "@/app/theme-script";
import { LeftRailWatchlist } from "@/components/LeftRailWatchlist";

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
  return (
    <html lang="en" data-mode="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 font-sans antialiased`}
      >
        <ThemeColorScript />
        <Suspense fallback={null}>
          <LeftRailWatchlist />
        </Suspense>
        <div className="relative flex min-h-screen flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
