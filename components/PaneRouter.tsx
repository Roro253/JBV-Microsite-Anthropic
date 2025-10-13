"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

import type { WatchlistMicrosite } from "@/components/WatchlistTable";
import { PaneShell } from "@/components/PaneShell";
import { ModeToggle } from "@/components/ModeToggle";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore } from "@/lib/store/ui";

interface PaneRouterProps {
  pane: ReactNode | null;
  meta: WatchlistMicrosite | null;
  modeParam?: string | null;
}

const focusableSelector =
  "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";

export function PaneRouter({ pane, meta, modeParam }: PaneRouterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const isOpen = Boolean(pane && meta);
  const paneRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const previousTitle = useRef<string | null>(null);
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const normalizedModeParam = useMemo(() => {
    if (modeParam === "investor" || modeParam === "explorer") {
      return modeParam;
    }
    return null;
  }, [modeParam]);

  const [hasSyncedParam, setHasSyncedParam] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasSyncedParam(false);
      return;
    }
    if (!hasSyncedParam && normalizedModeParam && normalizedModeParam !== mode) {
      setMode(normalizedModeParam);
      setHasSyncedParam(true);
    } else if (!hasSyncedParam) {
      setHasSyncedParam(true);
    }
  }, [hasSyncedParam, isOpen, mode, normalizedModeParam, setMode]);

  useEffect(() => {
    if (!isOpen || !meta) return;
    const current = searchParams.toString();
    const params = new URLSearchParams(current);
    params.set("pane", meta.slug);
    if (mode === "explorer") {
      params.delete("mode");
    } else {
      params.set("mode", mode);
    }
    const next = params.toString();
    if (next === current) return;
    const target = next ? `/?${next}` : "/";
    router.replace(target, { scroll: false });
  }, [isOpen, meta, mode, router, searchParams]);

  useEffect(() => {
    if (!isOpen || !meta) return;
    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement) {
      lastFocused.current = activeElement;
    }

    const node = paneRef.current;
    if (node) {
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector));
      const first = focusable[0] ?? node;
      window.requestAnimationFrame(() => {
        first.focus();
      });
    }

    document.body.style.overflow = "hidden";

    const liveRegion = liveRegionRef.current;
    if (liveRegion) {
      liveRegion.textContent = `${meta.name} details opened`;
    }

    return () => {
      document.body.style.overflow = "";
      if (liveRegion && previousTitle.current) {
        liveRegion.textContent = `${previousTitle.current} details closed`;
      }
      const last = lastFocused.current;
      if (last) {
        window.requestAnimationFrame(() => {
          last.focus();
        });
      }
    };
  }, [isOpen, meta]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePane();
        return;
      }
      if (event.key !== "Tab") return;
      const node = paneRef.current;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
      );
      if (!focusable.length) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closePane, isOpen]);

  useEffect(() => {
    if (meta?.name) {
      previousTitle.current = meta.name;
    }
  }, [meta?.name]);

  const closePane = useCallback(() => {
    router.replace("/", { scroll: false });
  }, [router]);

  const overlayMotion = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const paneMotion = prefersReducedMotion
    ? { initial: { opacity: 1, x: 0 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 1, x: 0 } }
    : { initial: { opacity: 0, x: 48 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 64 } };

  if (!meta) {
    return (
      <div aria-live="polite" className="sr-only" ref={liveRegionRef} />
    );
  }

  return (
    <>
      <div aria-live="polite" className="sr-only" ref={liveRegionRef} />
      <AnimatePresence>
        {isOpen && pane ? (
          <>
            <motion.div
              ref={overlayRef}
              className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm"
              onClick={closePane}
              {...overlayMotion}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-stretch justify-end md:items-end md:justify-end"
              {...paneMotion}
            >
              <PaneShell
                ref={paneRef}
                meta={meta}
                onClose={closePane}
                titleId="pane-dialog-title"
                prefersReducedMotion={prefersReducedMotion}
                modeToggle={<ModeToggle animate={false} />}
              >
                {pane}
              </PaneShell>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
