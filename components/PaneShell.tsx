"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { ModeToggle } from "@/components/ModeToggle";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button",
  "textarea",
  "input",
  "select",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

interface CompanySummary {
  slug: string;
  name: string;
  symbol?: string | null;
  logo?: string | null;
  status?: string | null;
}

interface PaneShellProps {
  company: CompanySummary;
  mode?: ExplorerInvestorMode;
  children: React.ReactNode;
}

export function PaneShell({ company, mode, children }: PaneShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const setMode = useUIStore((state) => state.setMode);

  const normalizedMode = useMemo(() => {
    if (mode === "explorer" || mode === "investor") {
      return mode;
    }
    const queryMode = searchParams?.get("mode");
    return queryMode === "explorer" || queryMode === "investor" ? queryMode : undefined;
  }, [mode, searchParams]);

  useEffect(() => {
    if (!normalizedMode) return;
    setMode(normalizedMode);
  }, [normalizedMode, setMode]);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const timeout = window.setTimeout(() => {
      headerRef.current?.focus();
    }, 10);

    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timeout);
      body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, []);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    params.delete("pane");
    params.delete("mode");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  const motionConfig = prefersReducedMotion
    ? { animate: { opacity: 1 }, initial: { opacity: 0 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 48 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 48 }
      };

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-end">
      <button
        type="button"
        aria-label="Close company details"
        className="absolute inset-0 cursor-pointer bg-slate-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        onClick={handleClose}
      />
      <motion.section
        {...motionConfig}
        transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "relative ml-auto flex h-full w-full flex-col bg-white/90 text-slate-900 backdrop-blur-xl",
          "shadow-2xl shadow-slate-900/30 md:w-[60vw] lg:w-[1100px]",
          "md:rounded-l-3xl"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pane-heading"
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/60 bg-white/80 px-6 py-5 text-slate-700 backdrop-blur">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <span className="relative h-12 w-12 overflow-hidden rounded-full border border-white/70 bg-white/60 shadow-inner">
                <Image src={company.logo} alt="" fill sizes="48px" className="object-contain" />
              </span>
            ) : null}
            <div>
              <h2
                id="pane-heading"
                ref={headerRef}
                tabIndex={-1}
                className="text-lg font-semibold text-slate-900 focus:outline-none"
              >
                {company.name}
              </h2>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{company.symbol}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle animate={!prefersReducedMotion} />
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-white/70 text-slate-500 transition hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <span className="sr-only">Close pane</span>
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-16 pt-4 sm:px-4 md:px-6">
          {children}
        </div>
      </motion.section>
    </div>
  );
}
