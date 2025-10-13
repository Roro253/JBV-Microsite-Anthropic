"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { cn } from "@/lib/utils";

interface PaneShellProps {
  meta: WatchlistMicrosite;
  onClose: () => void;
  children: ReactNode;
  titleId: string;
  prefersReducedMotion?: boolean;
  modeToggle?: React.ReactNode;
}

export const PaneShell = forwardRef<HTMLDivElement, PaneShellProps>(function PaneShell(
  { meta, children, onClose, titleId, prefersReducedMotion = false, modeToggle },
  ref
) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br from-white/98 via-sky-50/90 to-white/95",
        "shadow-2xl outline-none",
        "md:w-[min(48vw,760px)] md:rounded-l-[36px]"
      )}
    >
      <div className="relative border-b border-slate-100/80 bg-white/70 px-5 pb-4 pt-5 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {meta.logo ? (
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-[0_10px_30px_rgba(12,78,132,0.1)]">
                <Image src={meta.logo} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
              </span>
            ) : null}
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {meta.name}
              </h2>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-white">
                  {meta.symbol}
                </span>
                {meta.round ? <span>{meta.round}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {modeToggle ?? null}
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/80",
                "text-slate-500 transition hover:border-slate-300 hover:text-slate-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              )}
            >
              <span className="sr-only">Close {meta.name} details</span>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
        {meta.notes ? (
          <p className="mt-3 text-sm text-slate-500">{meta.notes}</p>
        ) : null}
      </div>
      <div className="relative flex-1 overflow-y-auto px-5 pb-10 pt-6" data-pane-scroll>
        <div
          className={cn(
            "mx-auto flex w-full max-w-3xl flex-col gap-10",
            prefersReducedMotion ? undefined : "scroll-smooth"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
