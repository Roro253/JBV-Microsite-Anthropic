"use client";

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

interface PaneShellProps {
  company: WatchlistMicrosite;
  mode?: string;
  children: ReactNode;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea",
  "input",
  "select",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const DEFAULT_MODE: ExplorerInvestorMode = "investor";

export function PaneShell({ company, mode, children }: PaneShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const setGlobalMode = useUIStore((state) => state.setMode);

  const [activeMode, setActiveMode] = useState<ExplorerInvestorMode>(() =>
    mode === "explorer" || mode === "investor" ? mode : DEFAULT_MODE
  );

  useEffect(() => {
    const normalized = mode === "explorer" || mode === "investor" ? mode : DEFAULT_MODE;
    setActiveMode(normalized);
    setGlobalMode(normalized);
  }, [mode, setGlobalMode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const closePane = useCallback(() => {
    const targetPath = pathname || "/";
    router.replace(targetPath, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

    const node = containerRef.current;
    if (!node) return;

    const focusable = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    const target = focusable.length > 0 ? focusable[0] : node;
    target.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePane();
        return;
      }

      if (event.key === "Tab") {
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const focusArray = Array.from(focusable);
        const currentIndex = focusArray.findIndex((item) => item === document.activeElement);
        const lastIndex = focusArray.length - 1;

        if (event.shiftKey) {
          if (currentIndex <= 0) {
            event.preventDefault();
            focusArray[lastIndex]?.focus();
          }
        } else if (currentIndex === lastIndex) {
          event.preventDefault();
          focusArray[0]?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus({ preventScroll: true });
    };
  }, [closePane]);

  const handleOverlayClick = () => closePane();

  const handleModeChange = (nextMode: ExplorerInvestorMode) => {
    setActiveMode(nextMode);
    setGlobalMode(nextMode);

    const params = new URLSearchParams(searchParams?.toString());
    params.set("pane", company.slug);
    if (nextMode !== DEFAULT_MODE) {
      params.set("mode", nextMode);
    } else {
      params.delete("mode");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const valuation = useMemo(() => {
    if (!company.valuation_usd) return null;
    return formatShort(company.valuation_usd);
  }, [company.valuation_usd]);

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };

  const headingId = `pane-heading-${company.slug}`;

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      />
      <motion.aside
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={cn(
          "focus-visible:outline-none",
          "absolute inset-y-0 right-0 flex w-full max-w-none flex-col bg-white shadow-2xl",
          "md:w-[48vw] lg:w-[760px] md:rounded-l-3xl"
        )}
        initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 64 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: prefersReducedMotion ? 0 : 64 }}
        transition={transition}
        tabIndex={-1}
      >
        <div className="flex flex-col overflow-hidden">
          <header className="relative border-b border-slate-200 bg-white/80 px-5 pb-4 pt-5 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-200/60 via-slate-100 to-indigo-100 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.45)]">
                  <Image
                    src={company.logo || "/logos/placeholder.svg"}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain p-2.5"
                    sizes="48px"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-sky-600">JBV</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 id={headingId} className="text-xl font-semibold text-slate-900">
                      JBV › {company.name}
                    </h2>
                    {company.status ? (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">
                        {company.status.replace("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {company.symbol ? <span>{company.symbol}</span> : null}
                    {valuation ? <span aria-label="Valuation estimate">Valuation {valuation}</span> : null}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closePane}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label={`Close ${company.name} details`}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                {company.notes ? company.notes : "Investor-grade microsite"}
              </div>
              <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                {(["explorer", "investor"] as ExplorerInvestorMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleModeChange(item)}
                    className={cn(
                      "rounded-full px-3 py-1 transition",
                      activeMode === item
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                    aria-pressed={activeMode === item}
                  >
                    {item === "explorer" ? "Explorer" : "Investor"}
                  </button>
                ))}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white to-sky-50">
            {children}
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

function formatShort(value: number) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  return `$${value.toLocaleString()}`;
}
