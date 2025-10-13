"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import micrositesData from "@/data/microsites.json";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatUSDShort } from "@/components/Format";

interface MicrositeSummary {
  name: string;
  slug: string;
  symbol?: string | null;
  logo?: string | null;
  status?: string | null;
  valuation_usd?: number | null;
}

const items: MicrositeSummary[] = (micrositesData as MicrositeSummary[]).filter(Boolean);

const statusLabels: Record<string, string> = {
  active: "Active",
  coming_soon: "Coming soon",
  closed: "Closed"
};

export function LeftRailWatchlist() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = searchParams?.get("pane") ?? undefined;
  const currentMode = searchParams?.get("mode") ?? undefined;
  const [focusedIndex, setFocusedIndex] = useState(() => {
    if (!activeSlug) return 0;
    const index = items.findIndex((item) => item.slug === activeSlug);
    return index >= 0 ? index : 0;
  });

  const isGatewayRoute = pathname === "/";
  if (!isGatewayRoute) {
    return null;
  }

  const handleNavigate = (slug: string) => {
    const params = new URLSearchParams();
    params.set("pane", slug);
    if (currentMode === "explorer" || currentMode === "investor") {
      params.set("mode", currentMode);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (index + 1) % items.length;
      setFocusedIndex(nextIndex);
      requestAnimationFrame(() => {
        document.getElementById(`watchlist-chip-${items[nextIndex].slug}`)?.focus();
      });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (index - 1 + items.length) % items.length;
      setFocusedIndex(nextIndex);
      requestAnimationFrame(() => {
        document.getElementById(`watchlist-chip-${items[nextIndex].slug}`)?.focus();
      });
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      requestAnimationFrame(() => {
        document.getElementById(`watchlist-chip-${items[0].slug}`)?.focus();
      });
    } else if (event.key === "End") {
      event.preventDefault();
      const lastIndex = items.length - 1;
      setFocusedIndex(lastIndex);
      requestAnimationFrame(() => {
        document.getElementById(`watchlist-chip-${items[lastIndex].slug}`)?.focus();
      });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate(items[index].slug);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        aria-label="Company watchlist"
        className="sticky top-24 hidden h-[calc(100vh-6rem)] w-[96px] shrink-0 flex-col items-center gap-4 border-r border-white/40 bg-white/40 px-3 py-6 backdrop-blur-lg md:flex"
      >
        {items.map((item, index) => {
          const isActive = item.slug === activeSlug;
          const valuationLabel = item.valuation_usd
            ? `${formatUSDShort(Number(item.valuation_usd))} valuation`
            : "Valuation TBD";
          const statusLabel = item.status ? statusLabels[item.status] ?? item.status : "Status TBD";

          return (
            <Tooltip key={item.slug}>
              <TooltipTrigger asChild>
                <button
                  id={`watchlist-chip-${item.slug}`}
                  type="button"
                  className={cn(
                    "relative flex w-full flex-col items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-2 py-3 text-xs text-slate-600 shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    isActive &&
                      "border-transparent bg-gradient-to-br from-sky-100 via-white to-indigo-50 text-sky-700 shadow-sky-200",
                    !isActive && "hover:bg-white"
                  )}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavigate(item.slug)}
                  onKeyDown={(event) => handleKey(event, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onMouseEnter={() => {
                    const params = new URLSearchParams();
                    params.set("pane", item.slug);
                    if (currentMode === "explorer" || currentMode === "investor") {
                      params.set("mode", currentMode);
                    }
                    router.prefetch(`/?${params.toString()}`);
                  }}
                >
                  <span className="relative h-10 w-10 overflow-hidden rounded-full border border-white/70 bg-white/80 shadow-inner">
                    {item.logo ? (
                      <Image src={item.logo} alt="" fill sizes="40px" className="object-contain" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {item.symbol?.slice(0, 4) ?? item.slug.slice(0, 4)}
                      </span>
                    )}
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                    {item.symbol ?? item.slug.slice(0, 4).toUpperCase()}
                  </span>
                  <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[0.6rem] font-semibold text-sky-700">
                    {statusLabel}
                  </span>
                  {isActive ? (
                    <span className="absolute inset-x-2 bottom-0 h-1 rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500" aria-hidden />
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{valuationLabel}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="relative z-10 flex w-full gap-3 overflow-x-auto border-b border-white/50 bg-white/60 px-4 py-3 shadow-sm backdrop-blur md:hidden">
        {items.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => handleNavigate(item.slug)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500",
                isActive && "border-transparent bg-gradient-to-r from-sky-100 via-white to-indigo-50 text-sky-700"
              )}
            >
              <span className="relative h-6 w-6 overflow-hidden rounded-full border border-white/70 bg-white/80">
                {item.logo ? (
                  <Image src={item.logo} alt="" fill sizes="24px" className="object-contain" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    {item.symbol?.slice(0, 4) ?? item.slug.slice(0, 4)}
                  </span>
                )}
              </span>
              {item.symbol ?? item.slug.slice(0, 4).toUpperCase()}
            </button>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
