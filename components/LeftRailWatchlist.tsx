"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { formatUSDShort } from "@/components/Format";
import { cn } from "@/lib/utils";

interface LeftRailWatchlistProps {
  items: WatchlistMicrosite[];
  activeSlug?: string | null;
}

const focusableSelector =
  "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";

function normalizeSlug(slug?: string | null) {
  if (!slug) return null;
  return slug.toLowerCase();
}

function useInitialFocusedIndex(items: WatchlistMicrosite[], activeSlug?: string | null) {
  return useMemo(() => {
    if (!activeSlug) return 0;
    const index = items.findIndex((item) => item.slug === activeSlug);
    return index === -1 ? 0 : index;
  }, [items, activeSlug]);
}

export function LeftRailWatchlist({ items, activeSlug }: LeftRailWatchlistProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const normalizedActive = normalizeSlug(activeSlug);
  const initialIndex = useInitialFocusedIndex(items, normalizedActive ?? undefined);
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFocusedIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!containerRef.current) return;
    const focusables = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    if (!focusables.length) return;
    const target = focusables[focusedIndex];
    if (!target) return;
    target.setAttribute("tabindex", "0");
    return () => {
      target.setAttribute("tabindex", "-1");
    };
  }, [focusedIndex]);

  useEffect(() => {
    if (!containerRef.current) return;
    const focusables = containerRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    focusables.forEach((node, index) => {
      node.setAttribute("tabindex", index === focusedIndex ? "0" : "-1");
    });
  }, [focusedIndex, items.length]);

  const handleActivate = (slug: string) => {
    const nextUrl = `/?pane=${slug}`;
    try {
      router.prefetch(nextUrl);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[left-rail] prefetch failed", error);
      }
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("pane", slug);
    const target = `/?${params.toString()}`;
    if (normalizedActive) {
      router.replace(target, { scroll: false });
    } else {
      router.push(target, { scroll: false });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = (index + 1) % items.length;
      setFocusedIndex(next);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (index - 1 + items.length) % items.length;
      setFocusedIndex(next);
    }
  };

  const isGatewayRoute = pathname === "/" || pathname === "";

  return (
    <TooltipProvider delayDuration={150}>
      <nav
        ref={containerRef}
        aria-label="Company watchlist"
        className={cn(
          "sticky top-24 hidden h-[min(75vh,620px)] w-[86px] flex-col items-center gap-3 rounded-3xl border border-sky-100/70",
          "bg-white/40 p-3 shadow-[0_12px_45px_rgba(15,102,172,0.08)] backdrop-blur-xl",
          "md:flex"
        )}
      >
        {items.map((item, index) => {
          const isActive = normalizeSlug(item.slug) === normalizedActive;
          const valuationLabel = item.valuation_usd
            ? `${formatUSDShort(item.valuation_usd)} valuation`
            : "Valuation TBA";
          return (
            <Tooltip key={item.slug}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleActivate(item.slug)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={cn(
                    "group relative flex h-16 w-16 items-center justify-center rounded-2xl border",
                    "border-transparent bg-white/80 shadow-[0_10px_30px_rgba(12,78,132,0.08)] transition-all",
                    "hover:-translate-y-0.5 hover:border-sky-200/80 hover:shadow-[0_18px_50px_rgba(12,78,132,0.14)]",
                    isActive
                      ? "border-sky-400/60 bg-gradient-to-br from-white/95 via-sky-50/90 to-sky-100/60 ring-2 ring-sky-300/60"
                      : "focus-visible:ring-2 focus-visible:ring-sky-300/70"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-pressed={isActive}
                >
                  <span className="absolute -top-2 right-2 min-w-[42px] rounded-full bg-slate-900/85 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
                    {item.symbol}
                  </span>
                  {item.logo ? (
                    <Image
                      src={item.logo}
                      alt={`${item.name} logo`}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">{item.symbol}</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[220px] text-left">
                <div className="font-semibold text-slate-800">{item.name}</div>
                <div className="text-slate-500">{valuationLabel}</div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      {isGatewayRoute ? (
        <div className="md:hidden">
          <nav
            aria-label="Company watchlist"
            className="-mx-2 flex items-center gap-2 overflow-x-auto px-2 py-3"
          >
            {items.map((item) => {
              const isActive = normalizeSlug(item.slug) === normalizedActive;
              const valuationLabel = item.valuation_usd
                ? `${formatUSDShort(item.valuation_usd)} valuation`
                : "Valuation TBA";

              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleActivate(item.slug)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border border-sky-100/60 px-3 py-1.5 text-xs font-medium",
                    "bg-white/70 shadow-[0_10px_30px_rgba(12,78,132,0.08)] backdrop-blur",
                    isActive
                      ? "border-sky-300/70 text-sky-700"
                      : "text-slate-500 hover:border-sky-200 hover:text-sky-600"
                  )}
                >
                  {item.logo ? (
                    <Image src={item.logo} alt="" width={18} height={18} className="h-5 w-5" />
                  ) : null}
                  <span>{item.symbol}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-400">{valuationLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      ) : null}
    </TooltipProvider>
  );
}
