"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import microsites from "@/data/microsites.json";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LeftRailItem {
  slug: string;
  name: string;
  symbol: string;
  status: "active" | "closed" | "coming_soon";
  logo: string;
  thesis?: string | null;
  valuationLabel?: string | null;
}

const ITEMS: LeftRailItem[] = (microsites as Array<Record<string, unknown>>).map((item) => ({
  slug: String(item.slug),
  name: String(item.name),
  symbol: item.symbol ? String(item.symbol) : "—",
  status: (item.status as LeftRailItem["status"]) ?? "active",
  logo: (item.logo as string) ?? "/logos/placeholder.svg",
  thesis: (item.notes as string) ?? null,
  valuationLabel:
    typeof item.valuation_usd === "number"
      ? formatBillions(item.valuation_usd as number)
      : item.round
        ? `${item.round} opportunity`
        : null
}));

function formatBillions(value: number) {
  const billions = value / 1_000_000_000;
  const precision = billions >= 10 ? 0 : 1;
  return `$${billions.toFixed(precision)}B`;
}

function usePaneHelpers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSlug = useMemo(() => {
    const paneSlug = searchParams.get("pane");
    if (paneSlug) return paneSlug;
    if (pathname.startsWith("/anthropic")) return "anthropic";
    if (pathname.startsWith("/openai")) return "openai";
    if (pathname.startsWith("/xai")) return "xai";
    return null;
  }, [pathname, searchParams]);

  const buildPaneUrl = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pane", slug);
      return `/${params.toString() ? `?${params.toString()}` : ""}`;
    },
    [searchParams]
  );

  const openPane = useCallback(
    (slug: string) => {
      const target = buildPaneUrl(slug);
      const shouldReplace = Boolean(searchParams.get("pane"));
      if (shouldReplace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [buildPaneUrl, router, searchParams]
  );

  const prefetchPane = useCallback(
    (slug: string) => {
      const target = buildPaneUrl(slug);
      router.prefetch(target).catch(() => {
        /* noop */
      });
    },
    [buildPaneUrl, router]
  );

  return { activeSlug, openPane, prefetchPane, pathname };
}

export function LeftRailWatchlist() {
  const { activeSlug, openPane, prefetchPane, pathname } = usePaneHelpers();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const nextIndex = ITEMS.findIndex((item) => item.slug === activeSlug);
    setFocusedIndex(nextIndex >= 0 ? nextIndex : 0);
  }, [activeSlug]);

  useEffect(() => {
    const ref = buttonRefs.current[focusedIndex];
    if (ref) {
      ref.tabIndex = 0;
    }
    buttonRefs.current.forEach((button, index) => {
      if (!button || index === focusedIndex) return;
      button.tabIndex = -1;
    });
  }, [focusedIndex]);

  const handleKeyDown = (index: number, slug: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % ITEMS.length;
      setFocusedIndex(next);
      buttonRefs.current[next]?.focus();
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = (index - 1 + ITEMS.length) % ITEMS.length;
      setFocusedIndex(prev);
      buttonRefs.current[prev]?.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      buttonRefs.current[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const last = ITEMS.length - 1;
      setFocusedIndex(last);
      buttonRefs.current[last]?.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPane(slug);
    }
  };

  if (pathname.startsWith("/login")) {
    return null;
  }

  const activeIndex = ITEMS.findIndex((item) => item.slug === activeSlug);

  return (
    <TooltipProvider delayDuration={80}>
      <nav
        aria-label="Company watchlist"
        className="flex min-h-0 flex-col items-center gap-4 rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.45)] backdrop-blur"
      >
        {ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Tooltip key={item.slug}>
              <TooltipTrigger asChild>
                <button
                  ref={(element) => {
                    buttonRefs.current[index] = element;
                  }}
                  type="button"
                  tabIndex={index === focusedIndex ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={handleKeyDown(index, item.slug)}
                  onClick={() => openPane(item.slug)}
                  onMouseEnter={() => prefetchPane(item.slug)}
                  className={cn(
                    "group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-transparent bg-white/80 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 shadow-sm transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                    isActive
                      ? "border-sky-300 bg-gradient-to-br from-sky-100/80 via-white to-sky-200/70 text-sky-700 shadow-[0_14px_40px_-28px_rgba(15,118,189,0.6)]"
                      : "hover:border-sky-200 hover:text-sky-600"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.symbol}</span>
                  <span className="sr-only">{item.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="w-60 bg-white/90 text-slate-700 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200">
                    <Image src={item.logo} alt={`${item.name} logo`} fill className="object-contain p-2" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    {item.valuationLabel ? (
                      <p className="text-xs text-slate-500">{item.valuationLabel}</p>
                    ) : null}
                  </div>
                </div>
                {item.thesis ? <p className="mt-3 text-xs text-slate-600">{item.thesis}</p> : null}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function WatchlistPanePills() {
  const { activeSlug, openPane, prefetchPane, pathname } = usePaneHelpers();

  if (pathname.startsWith("/login")) {
    return null;
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-2 text-xs text-slate-500 shadow-sm backdrop-blur">
        {ITEMS.map((item) => {
          const isActive = item.slug === activeSlug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => openPane(item.slug)}
              onMouseEnter={() => prefetchPane(item.slug)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold uppercase tracking-[0.25em] transition",
                isActive
                  ? "bg-sky-100 text-sky-700"
                  : "bg-white/80 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.symbol}</span>
              <span className="text-[10px] tracking-tight text-slate-400">{item.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
