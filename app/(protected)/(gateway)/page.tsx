import type { ReactNode } from "react";

import microsites from "@/data/microsites.json";
import { LeftRailWatchlist } from "@/components/LeftRailWatchlist";
import { PaneRouter } from "@/components/PaneRouter";
import { WatchlistTable, type WatchlistMicrosite } from "@/components/WatchlistTable";
import AnthropicPanePage from "@/app/(protected)/(gateway)/@pane/(microsites)/anthropic/page";
import OpenAIPanePage from "@/app/(protected)/(gateway)/@pane/(microsites)/openai/page";
import XAIPanePage from "@/app/(protected)/(gateway)/@pane/(microsites)/xai/page";

const background =
  "bg-[radial-gradient(circle_at_top,_rgba(186,226,255,0.45),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(214,233,255,0.35),_transparent_55%),#f8fbff]";

type SearchParams = Record<string, string | string[] | undefined>;

function resolvePaneContent(slug: string | null): ReactNode | null {
  switch (slug) {
    case "anthropic":
      return <AnthropicPanePage />;
    case "openai":
      return <OpenAIPanePage />;
    case "xai":
      return <XAIPanePage />;
    default:
      return null;
  }
}

function getParamValue(param: string | string[] | undefined) {
  if (Array.isArray(param)) {
    return param[0] ?? null;
  }
  return typeof param === "string" ? param : null;
}

export default function GatewayPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const items = (microsites as WatchlistMicrosite[]).filter(Boolean);
  const paneSlugRaw = getParamValue(searchParams.pane);
  const paneSlug = paneSlugRaw ? paneSlugRaw.toLowerCase() : null;
  const modeParam = getParamValue(searchParams.mode)?.toLowerCase() ?? null;
  const activeMicrosite = paneSlug
    ? items.find((item) => item.slug === paneSlug) ?? null
    : null;
  const paneContent = resolvePaneContent(activeMicrosite?.slug ?? null);
  const paneOpen = Boolean(paneContent && activeMicrosite);
  const featuredSlug =
    items.find((item) => item.status === "active")?.slug ?? items[0]?.slug ?? undefined;
  const typeformUrl = process.env.NEXT_PUBLIC_TYPEFORM_URL ?? null;

  return (
    <main className={`relative min-h-screen ${background}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-6 sm:px-4 sm:pb-16 sm:pt-10 md:flex-row md:items-start md:gap-8">
        <LeftRailWatchlist items={items} activeSlug={activeMicrosite?.slug} />
        <div
          className={
            "relative flex flex-1 flex-col rounded-[32px] border border-white/50 bg-white/70 p-4 shadow-[0_28px_80px_rgba(31,86,135,0.12)] backdrop-blur"
          }
        >
          <div
            className={`flex flex-1 flex-col gap-6 rounded-[26px] border border-slate-100/60 bg-white/80 px-4 py-6 shadow-[0_18px_46px_rgba(19,76,128,0.08)] transition-opacity duration-200 md:px-6 md:py-8 ${
              paneOpen ? "md:opacity-90" : "md:opacity-100"
            }`}
          >
            <WatchlistTable items={items} featuredSlug={featuredSlug} typeformUrl={typeformUrl} />
            <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600">
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
        </div>
      </div>
      <PaneRouter pane={paneContent} meta={activeMicrosite} modeParam={modeParam} />
    </main>
  );
}
