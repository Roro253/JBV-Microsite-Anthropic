import { Suspense } from "react";

import microsites from "@/data/microsites.json";
import { WatchlistTable, type WatchlistMicrosite } from "@/components/WatchlistTable";
import { PaneRouter } from "@/components/PaneRouter";
import { cn } from "@/lib/utils";

const background =
  "bg-[radial-gradient(circle_at_top,_rgba(186,226,255,0.45),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(214,233,255,0.35),_transparent_55%),#f8fbff]";

export default async function WatchlistPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const items = (microsites as WatchlistMicrosite[]).filter(Boolean);
  const featuredSlug =
    items.find((item) => item.status === "active")?.slug ?? items[0]?.slug ?? undefined;
  const typeformUrl = process.env.NEXT_PUBLIC_TYPEFORM_URL ?? null;
  const paneKey =
    typeof resolvedSearchParams?.pane === "string" ? resolvedSearchParams.pane : undefined;
  const modeParam =
    typeof resolvedSearchParams?.mode === "string" ? resolvedSearchParams.mode : undefined;

  return (
    <main className={cn("relative flex flex-1 flex-col", background)}>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-4 pb-12 pt-6 transition-opacity sm:pb-16 sm:pt-10",
          paneKey ? "md:opacity-90" : "md:opacity-100"
        )}
      >
        <Suspense fallback={null}>
          <WatchlistTable items={items} featuredSlug={featuredSlug} typeformUrl={typeformUrl} />
        </Suspense>
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
      <Suspense fallback={null}>
        <PaneRouter paneKey={paneKey} mode={modeParam} />
      </Suspense>
    </main>
  );
}
