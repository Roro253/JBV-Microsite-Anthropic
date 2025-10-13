"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { ModeToggle } from "@/components/ModeToggle";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

interface PaneShellProps {
  companyName: string;
  companySlug: string;
  logoSrc: string;
  symbol: string;
  statusLabel?: string;
  valuationLabel?: string;
  thesisLine?: string | null;
  children: React.ReactNode;
  supportsModeToggle?: boolean;
}

export function PaneShell({
  companyName,
  companySlug,
  logoSrc,
  symbol,
  statusLabel,
  valuationLabel,
  thesisLine,
  children,
  supportsModeToggle = true
}: PaneShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const paneRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<Element | null>(null);
  const setMode = useUIStore((state) => state.setMode);
  const currentMode = useUIStore((state) => state.mode);
  const [hasRendered, setHasRendered] = useState(false);

  const activeModeFromSearch = useMemo<ExplorerInvestorMode>(() => {
    const param = searchParams.get("mode");
    return param === "explorer" || param === "investor" ? param : "investor";
  }, [searchParams]);

  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement;
    setHasRendered(true);
    const liveRegion = liveRegionRef.current;
    if (liveRegion) {
      liveRegion.textContent = `${companyName} details opened.`;
    }
    return () => {
      const target = previouslyFocusedElementRef.current;
      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }
    };
  }, [companyName]);

  useEffect(() => {
    if (!hasRendered) return;
    if (currentMode === activeModeFromSearch) return;
    setMode(activeModeFromSearch);
  }, [activeModeFromSearch, currentMode, hasRendered, setMode]);

  useEffect(() => {
    if (!hasRendered) return;
    const header = headerRef.current;
    if (header) {
      header.focus({ preventScroll: true });
    }
  }, [hasRendered]);

  const closePane = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pane");
    params.delete("mode");
    const target = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    const liveRegion = liveRegionRef.current;
    if (liveRegion) {
      liveRegion.textContent = `${companyName} details closed.`;
    }
    router.replace(target, { scroll: false });
  }, [companyName, pathname, router, searchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePane();
        return;
      }
      if (event.key !== "Tab") return;
      const container = paneRef.current;
      if (!container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.offsetParent !== null || element.getAttribute("aria-hidden") !== "true"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePane]);

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === overlayRef.current) {
        closePane();
      }
    },
    [closePane]
  );

  const handleModeChange = useCallback(
    (nextMode: ExplorerInvestorMode) => {
      setMode(nextMode);
      const params = new URLSearchParams(searchParams.toString());
      params.set("pane", companySlug);
      params.set("mode", nextMode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [companySlug, pathname, router, searchParams, setMode]
  );

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] };

  return (
    <AnimatePresence initial={false}>
      <div className="pointer-events-none fixed inset-0 z-[80] flex">
        <motion.div
          ref={overlayRef}
          className="pointer-events-auto absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          onClick={handleOverlayClick}
        />
        <motion.section
          ref={paneRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`pane-${companySlug}-title`}
          className={cn(
            "pointer-events-auto ml-auto flex h-full w-full flex-col bg-white/95 text-slate-900 shadow-2xl ring-1 ring-slate-200/70 backdrop-blur-xl",
            "md:w-[min(48vw,760px)]"
          )}
          initial={{ x: prefersReducedMotion ? 0 : 48, opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: prefersReducedMotion ? 0 : 40, opacity: prefersReducedMotion ? 1 : 0 }}
          transition={transition}
        >
          <div className="flex flex-col border-b border-slate-200/80 bg-white/70 px-6 pb-4 pt-6 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">JBV › {companyName}</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-sky-200/70 bg-sky-100/40">
                  <Image src={logoSrc} alt={`${companyName} logo`} fill className="object-contain p-2" />
                </div>
                <div>
                  <h2
                    id={`pane-${companySlug}-title`}
                    ref={headerRef}
                    tabIndex={-1}
                    className="text-xl font-semibold text-slate-900 focus:outline-none"
                  >
                    {companyName} <span className="text-sm text-slate-400">({symbol})</span>
                  </h2>
                  {valuationLabel ? (
                    <p className="text-sm text-slate-500">{valuationLabel}</p>
                  ) : null}
                  {thesisLine ? <p className="mt-1 text-sm text-slate-500">{thesisLine}</p> : null}
                  {statusLabel ? (
                    <span className="mt-2 inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-600">
                      {statusLabel}
                    </span>
                  ) : null}
              </div>
              {supportsModeToggle ? (
                <ModeToggle
                  className="mt-4 flex w-full justify-between text-xs text-slate-500 md:hidden"
                  animate={!prefersReducedMotion}
                  forceVisible
                  onModeChange={handleModeChange}
                />
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {supportsModeToggle ? (
                <ModeToggle
                  className="hidden text-xs text-slate-500 md:flex"
                    animate={!prefersReducedMotion}
                    forceVisible
                    onModeChange={handleModeChange}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={closePane}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  aria-label={`Close ${companyName} details`}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-white/95 to-white/90">
            {children}
          </div>
          <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRegionRef} />
        </motion.section>
      </div>
    </AnimatePresence>
  );
}
