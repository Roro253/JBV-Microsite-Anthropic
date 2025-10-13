import { Suspense } from "react";

import microsites from "@/data/microsites.json";
import { PaneRouter } from "@/components/PaneRouter";
import { PaneSkeleton } from "@/components/PaneSkeleton";
import { WatchlistTable, type WatchlistMicrosite } from "@/components/WatchlistTable";

const background =
  "bg-[radial-gradient(circle_at_top,_rgba(186,226,255,0.45),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(214,233,255,0.35),_transparent_55%),#f8fbff]";

interface WatchlistPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function WatchlistPage({ searchParams }: WatchlistPageProps) {
  const items = (microsites as WatchlistMicrosite[]).filter(Boolean);
  const featuredSlug =
    items.find((item) => item.status === "active")?.slug ?? items[0]?.slug ?? undefined;
  const typeformUrl = process.env.NEXT_PUBLIC_TYPEFORM_URL ?? null;
  const pane = typeof searchParams?.pane === "string" ? searchParams?.pane : null;
  const mode = typeof searchParams?.mode === "string" ? searchParams?.mode : null;

  return (
    <>
      <main className={`min-h-screen ${background}`}>
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:pb-16 sm:pt-10">
          <WatchlistTable
            items={items}
            featuredSlug={featuredSlug}
            typeformUrl={typeformUrl}
            activePane={pane}
          />
          <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <p>
              This portal is informational only and does not constitute an offer to sell or solicit an
              offer to buy securities. Forward-looking statements are illustrative and subject to
              change.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-slate-500">
              <span>© {new Date().getFullYear()} JBV Capital</span>
              <span>Next Frontier Launch: Q1 2026</span>
            </div>
          </footer>
        </div>
      </main>
      <Suspense fallback={<PaneSkeleton />}>
        <PaneRouter pane={pane} mode={mode} />
      </Suspense>
    </>
  );
}
