import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Providers } from "@/app/providers";
import { ModeWatcher } from "@/components/ModeWatcher";
import { SeoProvider } from "@/components/SeoProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsToggle } from "@/components/AnalyticsToggle";
import { CookieNotice } from "@/components/CookieNotice";
import { getAnthropicData } from "@/lib/data";
import { verifySessionToken } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("jbv_session");
  const session = sessionCookie ? await verifySessionToken(sessionCookie.value) : null;

  if (!session) {
    redirect("/login");
  }

  const data = getAnthropicData();

  return (
    <>
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
        <Footer className="mt-auto lg:sticky lg:bottom-0" lastUpdated={data.last_updated} />
      </div>
      <AnalyticsToggle />
      <CookieNotice />
    </>
  );
}
