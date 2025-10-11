"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const horizonOptions = [
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
  { value: "7+", label: "7+ years" }
] as const;

const riskOptions = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" }
] as const;

const ticketOptions = [
  { value: "sub250", label: "<$250k" },
  { value: "mid", label: "$250k–$1M" },
  { value: "plus", label: "$1M+" }
] as const;

type RiskValue = (typeof riskOptions)[number]["value"];
type HorizonValue = (typeof horizonOptions)[number]["value"];
type TicketValue = (typeof ticketOptions)[number]["value"];

type PortfolioRecommendation = {
  profile: string;
  suggestion: string;
  rationale: string;
};

const recommendations: Record<RiskValue, PortfolioRecommendation> = {
  conservative: {
    profile: "JBV Shielded",
    suggestion: "80% Anthropic anchor / 20% diversified frontier basket",
    rationale:
      "Preserves downside with Anthropic's safety-first governance and cloud distribution while keeping optionality across vetted frontier pilots."
  },
  balanced: {
    profile: "JBV Balanced",
    suggestion: "65% Anthropic core / 35% frontier acceleration",
    rationale:
      "Blends Anthropic's enterprise ARR with emerging co-investments to balance durable cash compounding and upside access."
  },
  aggressive: {
    profile: "JBV Velocity",
    suggestion: "50% Anthropic core / 50% frontier lab + follow-on dry powder",
    rationale:
      "Leans into hyperscaler-backed growth while reserving follow-on capital for compounding alongside Anthropic's long-context moat."
  }
};

interface PortfolioFitProps {
  animate?: boolean;
  className?: string;
  onResult?: (result: PortfolioRecommendation) => void;
}

export function PortfolioFit({ animate = true, className, onResult }: PortfolioFitProps) {
  const [horizon, setHorizon] = useState<HorizonValue>(horizonOptions[1].value);
  const [risk, setRisk] = useState<RiskValue>("balanced");
  const [ticket, setTicket] = useState<TicketValue>(ticketOptions[1].value);

  const result = useMemo(() => {
    const base = recommendations[risk];

    const horizonFocus =
      risk === "conservative"
        ? "capital preservation"
        : risk === "balanced"
          ? "risk-adjusted velocity"
          : "frontier compounding";

    const ticketNote = (() => {
      switch (ticket) {
        case "sub250":
          return "keeps syndication light";
        case "mid":
          return "offers flexible SPV sizing";
        default:
          return "addresses flagship allocations";
      }
    })();

    const rationale = `${base.rationale} Horizons at ${horizon} strengthen ${horizonFocus}. Ticket size ${ticketNote}.`;
    return { ...base, rationale };
  }, [horizon, risk, ticket]);

  useEffect(() => {
    onResult?.(result);
  }, [onResult, result]);

  const renderGroup = <T extends { value: string; label: string }>(
    label: string,
    options: readonly T[],
    value: string,
    setValue: (value: T["value"]) => void
  ) => (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={option.value === value ? "default" : "ghost"}
            onClick={() => setValue(option.value)}
            className={cn(
              "h-auto flex-col gap-1 rounded-2xl border border-sky-100 px-3 py-4 text-sm",
              option.value === value
                ? "border-sky-300 bg-sky-100/80 text-sky-800"
                : "text-slate-500 hover:text-sky-600"
            )}
          >
            <span className="text-sm font-semibold">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-3xl border border-sky-200 bg-white/85 p-6 shadow-[0_30px_60px_-45px_rgba(32,118,199,0.3)]",
        className
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Portfolio intake
        </p>
        <h3 className="text-2xl font-semibold text-slate-800">Your portfolio fit</h3>
      </div>
      <div className="space-y-6">
        {renderGroup("Horizon", horizonOptions, horizon, setHorizon)}
        {renderGroup("Risk posture", riskOptions, risk, setRisk)}
        {renderGroup("Ticket size", ticketOptions, ticket, setTicket)}
      </div>

      <motion.div
        initial={animate ? { opacity: 0, y: 12 } : false}
        animate={animate ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-2 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-slate-700 shadow-[0_20px_50px_-45px_rgba(32,118,199,0.35)]"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-sky-500/80">
          {result.profile}
        </p>
        <p className="text-lg font-semibold text-slate-800">{result.suggestion}</p>
        <p className="text-sm text-slate-600">{result.rationale}</p>
      </motion.div>
    </div>
  );
}
