"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { useUIStore } from "@/lib/store/ui";

interface NarrativeEntryPortalProps {
  subtitle?: string;
}

export function NarrativeEntryPortal({ subtitle }: NarrativeEntryPortalProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const setMode = useUIStore((state) => state.setMode);

  const springX = useSpring(0, {
    stiffness: 120,
    damping: 26,
    mass: 0.8
  });

  useEffect(() => {
    setMode("explorer");
  }, [setMode]);

  useEffect(() => {
    const unsub = x.on("change", (value) => {
      springX.set(prefersReducedMotion ? 0 : value);
    });
    return () => unsub();
  }, [prefersReducedMotion, springX, x]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const offsetX = (event.clientX / innerWidth - 0.5) * 80;
      const offsetY = (event.clientY / innerHeight - 0.5) * 24;
      x.set(offsetX);
      y.set(offsetY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion, x, y]);

  const leftX = useTransform(springX, (value) => -value / 2);
  const rightX = useTransform(springX, (value) => value / 2);
  const verticalTilt = useTransform(y, (value) => value / 8);

  return (
    <section className="relative isolate flex min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex-col justify-center overflow-hidden rounded-3xl border border-sky-200/80 bg-white/80 shadow-[0_40px_120px_-60px_rgba(32,118,199,0.55)]">
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        <motion.div
          style={{ x: leftX, rotateX: useTransform(verticalTilt, (value) => value / 6) }}
          className="relative flex items-center justify-center border-b border-sky-200/60 bg-gradient-to-br from-white via-sky-50/60 to-white px-12 py-16 text-slate-700 md:border-b-0 md:border-r"
        >
          <div
            aria-hidden
            className="absolute inset-5 rounded-[38px] border border-sky-300/40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, rgba(59,130,246,0.14) 0px, rgba(59,130,246,0.14) 1px, transparent 1px, transparent 22px)",
              maskImage:
                "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 45%, transparent)",
              opacity: 0.8
            }}
          />
          <div className="relative z-10 space-y-4 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.42em] text-sky-600">
              Alignment & Assurance
            </span>
            <p className="max-w-sm text-sm text-slate-600 md:text-base">
              Anthropic codifies constitutional guardrails so regulated enterprises adopt frontier intelligence with verifiable governance.
            </p>
          </div>
        </motion.div>
        <motion.div
          style={{ x: rightX, rotateX: useTransform(verticalTilt, (value) => -value / 6) }}
          className="relative flex items-center justify-center bg-gradient-to-bl from-sky-100 via-indigo-50/70 to-white px-12 py-16"
        >
          <div
            aria-hidden
            className="absolute inset-5 rounded-[38px] border border-indigo-300/40"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(125,211,252,0.12) 50%, transparent 80%), linear-gradient(315deg, rgba(129,140,248,0.3) 0%, transparent 60%)",
              maskImage:
                "radial-gradient(circle at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 48%, transparent 78%)"
            }}
          />
          <motion.div
            className="relative z-10 space-y-4 text-center md:text-right"
            animate={prefersReducedMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.42em] text-indigo-500">
              Scale & Distribution
            </span>
            <p className="max-w-sm text-sm text-slate-600 md:text-base">
              Hyperscaler distribution and long-context tooling let Anthropic extend frontier AI safely into institutional workflows.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative z-20 mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-16 text-center">
        <h1 className="text-balance text-3xl font-semibold text-slate-800 sm:text-4xl md:text-5xl">
          Anthropic AI — JBV Capital&apos;s conviction in alignment-led scale.
        </h1>
        <p className="text-pretty text-sm text-slate-600 sm:text-base">
          {subtitle ?? "Step inside the Anthropic investment narrative curated exclusively for JBV Capital partners and co-investors."}
        </p>
        <Button asChild size="lg" aria-label="Enter Anthropic microsite" className="mx-auto">
          <Link href="/anthropic" className="no-tap-highlight">
            Enter Anthropic
          </Link>
        </Button>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-sky-400/70 to-transparent md:block"
        style={{ x: springX }}
      />
    </section>
  );
}
