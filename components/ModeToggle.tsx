"use client";

import { useEffect, useRef, useState } from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore, type ExplorerInvestorMode } from "@/lib/store/ui";
import { cn } from "@/lib/utils";

const modes: { value: ExplorerInvestorMode; label: string }[] = [
  { value: "explorer", label: "Explorer" },
  { value: "investor", label: "Investor" }
];

interface ModeToggleProps {
  className?: string;
  animate?: boolean;
}

export function ModeToggle({ className, animate = true }: ModeToggleProps) {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const paneSlug = searchParams?.get("pane");
  const isMicrositePath =
    pathname.startsWith("/anthropic") || pathname.startsWith("/xai") || pathname.startsWith("/openai");
  const isMicrositeRoute = isMicrositePath || Boolean(paneSlug);
  const urlModeParam = searchParams?.get("mode");
  const effectiveUrlMode =
    urlModeParam === "explorer" || urlModeParam === "investor" ? urlModeParam : undefined;
  const hasSyncedRef = useRef(false);

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

  const handleChange = (value: string) => {
    if (!value) return;
    const nextMode = value as ExplorerInvestorMode;
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

  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <ToggleGroup.Root
      type="single"
      aria-label="Toggle explorer or investor mode"
      value={mounted ? mode : undefined}
      onValueChange={handleChange}
      className={cn(
        "relative flex w-auto items-center gap-1 overflow-hidden rounded-full border border-sky-200 bg-white/70 p-1 text-sm text-slate-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {mounted && shouldAnimate ? (
          <motion.span
            key={mode}
            layoutId="mode-toggle-indicator"
            className="absolute inset-y-1 w-1/2 rounded-full bg-gradient-to-r from-sky-300/70 via-indigo-300/60 to-sky-400/70"
            initial={{ opacity: 0.4, x: 0 }}
            animate={{
              opacity: 1,
              x: mode === "investor" ? "100%" : "0%"
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
              mass: 0.8
            }}
          />
        ) : null}
      </AnimatePresence>
      {!shouldAnimate && mounted ? (
        <span
          className={cn(
            "absolute inset-y-1 w-1/2 rounded-full bg-sky-300/40 transition-transform duration-200",
            mode === "investor" ? "translate-x-full" : "translate-x-0"
          )}
          aria-hidden
        />
      ) : null}

      {modes.map((item) => (
        <ToggleGroup.Item
          key={item.value}
          value={item.value}
          className={cn(
            "relative z-10 flex min-w-[110px] items-center justify-center gap-1 rounded-full px-4 py-2 font-medium transition-colors",
            item.value === mode
              ? "text-sky-700"
              : "text-slate-400 hover:text-sky-600"
          )}
        >
          {item.label} Mode
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
