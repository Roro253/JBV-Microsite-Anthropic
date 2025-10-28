"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

const modes: { value: ExplorerInvestorMode; label: string }[] = [
  { value: "explorer", label: "Explorer" },
  { value: "investor", label: "Investor" },
  { value: "intelligence", label: "Intelligence Feed" }
];

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const paneSlug = searchParams?.get("pane");
  const isMicrositePath =
    pathname.startsWith("/anthropic") || pathname.startsWith("/xai") || pathname.startsWith("/openai");
  const isMicrositeRoute = isMicrositePath || Boolean(paneSlug);
  const urlModeParam = searchParams?.get("mode");
  const effectiveUrlMode =
    urlModeParam === "explorer" || urlModeParam === "investor" || urlModeParam === "intelligence"
      ? urlModeParam
      : undefined;
  const hasSyncedRef = useRef(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelIds = useMemo(() => modes.map((item) => `mode-panel-${item.value}`), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isMicrositeRoute) {
      hasSyncedRef.current = false;
      return;
    }

    if (effectiveUrlMode) {
      hasSyncedRef.current = true;
      if (mode !== effectiveUrlMode) {
        setMode(effectiveUrlMode);
      }
      return;
    }

    if (!hasSyncedRef.current) {
      hasSyncedRef.current = true;
      if (mode !== "investor") {
        setMode("investor");
      }
    }
  }, [effectiveUrlMode, isMicrositeRoute, mode, mounted, setMode]);

  const handleSelectionChange = (nextMode: ExplorerInvestorMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);

    if (!isMicrositeRoute) {
      return;
    }

    const params = new URLSearchParams(searchParams ? searchParams.toString() : undefined);
    if (paneSlug) {
      params.set("pane", paneSlug);
    }

    if (nextMode === "investor") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }

    const query = params.toString();
    if (paneSlug) {
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    } else {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  if (!isMicrositeRoute) {
    return null;
  }

  const focusTab = (index: number) => {
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + modes.length) % modes.length;
    focusTab(nextIndex);
    const nextMode = modes[nextIndex].value;
    handleSelectionChange(nextMode);
  };

  return (
    <div
      role="tablist"
      aria-label="Select microsite mode"
      className={cn(
        "relative flex w-full flex-col gap-2 rounded-[var(--radius-xl)] border border-sky-200 bg-white/80 p-2 text-sm text-slate-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] backdrop-blur sm:flex-row sm:gap-0",
        className
      )}
    >
      {modes.map((item, index) => (
        <button
          key={item.value}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
          role="tab"
          id={`mode-tab-${item.value}`}
          aria-controls={panelIds[index]}
          aria-selected={mode === item.value}
          tabIndex={mode === item.value ? 0 : -1}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-lg)] px-4 py-2 font-medium transition-colors sm:min-w-0",
            mode === item.value
              ? "text-sky-700 font-semibold after:opacity-100"
              : "text-slate-500 hover:text-sky-600 after:opacity-0",
            "after:absolute after:bottom-1 after:left-6 after:right-6 after:h-0.5 after:rounded-full after:bg-sky-500 after:transition after:duration-200 after:ease-out"
          )}
          onClick={() => handleSelectionChange(item.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          <span className="truncate-ellipsis">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
