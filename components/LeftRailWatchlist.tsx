"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { formatUSDShort } from "@/components/Format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LeftRailWatchlistProps {
  items: WatchlistMicrosite[];
}

const ROVING_FOCUS_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

export function LeftRailWatchlist({ items }: LeftRailWatchlistProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pane = searchParams.get("pane");
  const visibleItems = useMemo(() => items.filter((item) => item.status !== "closed"), [items]);
  const defaultIndex = Math.max(0, visibleItems.findIndex((item) => item.slug === pane));

  const [focusIndex, setFocusIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (defaultIndex >= 0) {
      setFocusIndex(defaultIndex);
    }
  }, [defaultIndex]);

  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, visibleItems.length);
  }, [visibleItems.length]);

  if (pathname !== "/") {
    return null;
  }

  const handleNavigation = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("pane", slug);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!ROVING_FOCUS_KEYS.has(event.key)) return;

    event.preventDefault();
    let nextIndex = index;

    if (event.key === "ArrowDown") {
      nextIndex = index + 1 >= visibleItems.length ? 0 : index + 1;
    } else if (event.key === "ArrowUp") {
      nextIndex = index - 1 < 0 ? visibleItems.length - 1 : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = visibleItems.length - 1;
    }

    setFocusIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  const renderChip = (item: WatchlistMicrosite, index: number) => {
    const isActive = pane === item.slug;
    const valuation = item.valuation_usd ? formatUSDShort(item.valuation_usd) : "Valuation TBD";

    return (
      <Tooltip key={item.slug} delayDuration={80}>
        <TooltipTrigger asChild>
          <button
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            tabIndex={focusIndex === index ? 0 : -1}
            onClick={() => handleNavigation(item.slug)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onMouseEnter={() => router.prefetch(`${pathname}?pane=${item.slug}`)}
            className={cn(
              "group relative flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-3xl border bg-white/80 text-xs font-semibold text-slate-600 transition",
              "border-slate-200 shadow-[0_6px_18px_-12px_rgba(15,23,42,0.45)] hover:border-sky-300/60 hover:text-slate-800",
              isActive &&
                "border-sky-400/80 text-slate-900 shadow-[0_12px_30px_-16px_rgba(56,189,248,0.55)] ring-2 ring-sky-200"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-100/70 via-white to-slate-100 opacity-0 transition group-hover:opacity-100" />
            <div className="relative h-8 w-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Image
                src={item.logo || "/logos/placeholder.svg"}
                alt={`${item.name} logo`}
                fill
                sizes="32px"
                className="object-contain p-1.5"
              />
            </div>
            <span className="relative text-[11px] tracking-[0.25em] text-slate-500 group-hover:text-slate-700">
              {item.symbol}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="w-60 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-slate-200">
              <Image
                src={item.logo || "/logos/placeholder.svg"}
                alt={`${item.name} logo`}
                fill
                sizes="40px"
                className="object-contain p-2"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.notes ?? "Frontier AI focus"}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{valuation}</span>
            {item.round ? <span className="ml-2">{item.round}</span> : null}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <nav aria-label="Company watchlist" className="hidden md:flex md:w-24 md:flex-col md:items-center">
        <div className="sticky top-28 flex flex-col items-center gap-3">
          {visibleItems.map((item, index) => renderChip(item, index))}
        </div>
      </nav>
      <div className="md:hidden">
        <div className="-mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 pb-2">
          {visibleItems.map((item) => {
            const isActive = pane === item.slug;
            return (
              <button
                key={item.slug}
                type="button"
                className={cn(
                  "inline-flex min-w-[88px] items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                  "border-slate-200 bg-white/80 text-slate-600",
                  isActive && "border-sky-400 bg-sky-50 text-sky-700 shadow"
                )}
                onClick={() => handleNavigation(item.slug)}
                onMouseEnter={() => router.prefetch(`${pathname}?pane=${item.slug}`)}
              >
                <div className="relative h-5 w-5 overflow-hidden rounded-full border border-slate-200">
                  <Image
                    src={item.logo || "/logos/placeholder.svg"}
                    alt={`${item.name} logo`}
                    fill
                    sizes="20px"
                    className="object-contain p-1"
                  />
                </div>
                <span>{item.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
