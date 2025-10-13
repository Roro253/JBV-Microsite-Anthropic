import type { Metadata } from "next";

import { ThemeColorScript } from "@/app/theme-script";

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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeColorScript />
        {children}
      </body>
    </html>
  );
}
