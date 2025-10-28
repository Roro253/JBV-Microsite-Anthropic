"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { Edit3 } from "lucide-react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  formatUSDShort,
  formatPct,
  investedAfterFee,
  grossProceeds,
  jbvCarry
} from "@/lib/format";
import {
  formatGpuFleet,
  formatAsOfDate,
  formatBillions,
  formatUserRange,
  deriveSourceLabel
} from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { XFundModel } from "@/lib/xaiFundModel";

const STORAGE_KEY = "jbv:xai:fundmodel:v1";

const formatScenarioPct = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatPct(value * 100, { sign: true });
};

type PersistedState = {
  year: number;
  multiple: number;
  commitment: number;
  grossMoM: number;
  entryValuation?: number | null;
  ownershipPct?: number | null;
  customRevenues?: Record<number, number>;
  projectionMode?: "abs" | "yoy";
};

type TooltipPayload = {
  payload: { year: number; value: number; isNull?: boolean };
};

type TooltipSource = {
  label?: string;
  url: string;
};

type XAIInvestmentDashboardProps = {
  fundModel?: XFundModel | null;
};

export default function XAIInvestmentDashboard({ fundModel }: XAIInvestmentDashboardProps) {
  const prefersReducedMotion = useReducedMotion();

  const fallbackModel: XFundModel = {
    company_meta: {
      name: "xAI",
      mission: "",
      tagline: "",
      last_updated: new Date().toISOString().split("T")[0]
    },
    public_signals: {
      models: [],
      compute: {
        colossus_gpus_live: 0,
        claim_built_days: 1,
        uptime_pct: 0,
        scale_outlook: "",
        as_of: ""
      },
      fundraising_in_market: {
        amount_usd: 0,
        mix: { equity_usd: 0, debt_usd: 0 },
        notable_participant: undefined,
        purpose: undefined,
        status: "",
        as_of: ""
      },
      users_estimate: {
        maus_min: 0,
        maus_max: 0,
        as_of: "",
        note: undefined
      },
      world_model_plan: {
        target: "",
        hires: undefined,
        as_of: ""
      },
      sources: {}
    },
    investment_scenarios: {
      defaults: {
        commitment_usd: 1_000_000,
        mgmt_fee_pct: 0.05,
        carry_pct: 0.1
      },
      entry: {
        pre_or_post: "scenario",
        entry_valuation_usd: null,
        ownership_pct: null,
        note: undefined
      }
    },
    market_cap_calculator: [{ year: new Date().getFullYear(), revenue_run_rate_usd: null }],
    market_comps: []
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[XAIInvestmentDashboard] fundModel:', fundModel);
  }
  const model = fundModel ?? fallbackModel;
  const hasData = Boolean(fundModel && Object.keys(fundModel).length > 0);

  const defaultYear = model.market_cap_calculator[0]?.year ?? new Date().getFullYear();
  const defaultCommitment = model.investment_scenarios.defaults.commitment_usd ?? 1_000_000;

  const [year, setYear] = useState<number>(defaultYear);
  const [multiple, setMultiple] = useState<number>(20);
  const [commitment, setCommitment] = useState<number>(defaultCommitment);
  const [grossMoM, setGrossMoM] = useState<number>(3);
  const [entryValuation, setEntryValuation] = useState<number | null>(
    model.investment_scenarios.entry.entry_valuation_usd
  );
  const [ownershipPct, setOwnershipPct] = useState<number | null>(
    model.investment_scenarios.entry.ownership_pct
  );
  const initialCustomRevenues = useMemo(() => ({} as Record<number, number>), []);
  const [customRevenues, setCustomRevenues] = useState<Record<number, number>>(initialCustomRevenues);
  const hasInitialProjections = model.market_cap_calculator.some(
    (item) => item.revenue_run_rate_usd !== null
  );
  const [projectionMode, setProjectionMode] = useState<"abs" | "yoy">("abs");
  const [projectionsEditing, setProjectionsEditing] = useState<boolean>(!hasInitialProjections);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as PersistedState;
      if (saved.year) setYear(saved.year);
      if (saved.multiple) setMultiple(saved.multiple);
      if (saved.commitment) setCommitment(saved.commitment);
      if (saved.grossMoM) setGrossMoM(saved.grossMoM);
      if (saved.entryValuation !== undefined) setEntryValuation(saved.entryValuation);
      if (saved.ownershipPct !== undefined) setOwnershipPct(saved.ownershipPct);
      if (saved.customRevenues) setCustomRevenues(saved.customRevenues);
      if (saved.projectionMode) setProjectionMode(saved.projectionMode);
    } catch (error) {
      console.warn("[xai-fund-model] unable to restore state", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      year,
      multiple,
      commitment,
      grossMoM,
      entryValuation,
      ownershipPct,
      customRevenues,
      projectionMode
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [year, multiple, commitment, grossMoM, entryValuation, ownershipPct, customRevenues, projectionMode]);

  useEffect(() => {
    if (!hasData) return;
    const availableYears = model.market_cap_calculator.map((item) => item.year);
    if (!availableYears.includes(year)) {
      setYear(availableYears[0]);
    }
  }, [model, year, hasData]);

  const years = model.market_cap_calculator.map((item) => item.year);
  const selectedYearData =
    model.market_cap_calculator.find((item) => item.year === year) ?? model.market_cap_calculator[0];

  const baseRunRate = selectedYearData.revenue_run_rate_usd;
  const customRunRate = customRevenues[year];
  const revenueRunRate = customRunRate ?? baseRunRate ?? null;

  const multiples = useMemo(() => Array.from({ length: 21 }, (_, index) => 10 + index), []);

  const marketCap = revenueRunRate !== null ? revenueRunRate * multiple : null;

  const hasRunRate = marketCap !== null;

  const waterfallDefaults = model.investment_scenarios.defaults;
  const mgmtFee = waterfallDefaults.mgmt_fee_pct;
  const carryPct = waterfallDefaults.carry_pct;

  const invested = investedAfterFee(commitment, mgmtFee);
  const ownershipDecimal = ownershipPct != null ? ownershipPct / 100 : null;
  const useOwnershipPath = ownershipDecimal != null && hasRunRate;

  const gross = useOwnershipPath && marketCap !== null
    ? ownershipDecimal! * marketCap
    : grossProceeds(invested, grossMoM);
  const grossProfit = gross - invested;
  const carry = jbvCarry(grossProfit, carryPct);
  const net = gross - carry;
  const netMoM = commitment > 0 ? net / commitment : 0;

  const baseRevenues = model.market_cap_calculator.map((item) => {
    const value = customRevenues[item.year] ?? item.revenue_run_rate_usd ?? null;
    return {
      year: item.year,
      value,
      isNull: value === null
    };
  });

  const projectionSeries = useMemo(() => {
    return baseRevenues.map((entry, index) => {
      if (projectionMode === "abs") {
        return {
          year: entry.year,
          value: entry.value ?? 0,
          isNull: entry.isNull
        };
      }
      const previous = baseRevenues[index - 1]?.value ?? null;
      const current = entry.value ?? null;
      const yoy = previous && current ? ((current - previous) / previous) * 100 : null;
      return {
        year: entry.year,
        value: yoy ?? 0,
        isNull: yoy == null
      };
    });
  }, [baseRevenues, projectionMode]);

  const hasProjectionValues = projectionSeries.some((entry) => !entry.isNull);

  const selectedProjection = projectionSeries.find((entry) => entry.year === year) ?? projectionSeries[0];

  useEffect(() => {
    if (!hasProjectionValues) {
      setProjectionsEditing(true);
    }
  }, [hasProjectionValues]);

  if (!hasData) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/85 p-8 text-center shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)]">
        <h2 className="text-xl font-semibold text-slate-800">Data temporarily unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">
          We’re refreshing the model inputs. Try again shortly.
        </p>
      </section>
    );
  }

  const sources = model.public_signals.sources ?? {};

  const computeDetails = `${formatGpuFleet(model.public_signals.compute.colossus_gpus_live)} GPUs · ${model.public_signals.compute.uptime_pct}% uptime · built in ${model.public_signals.compute.claim_built_days} days`;
  const fundraiseAsOf = formatAsOfDate(model.public_signals.fundraising_in_market.as_of);
  const fundraiseDetails = `In market: up to ${formatBillions(model.public_signals.fundraising_in_market.amount_usd)} (equity ~${formatBillions(model.public_signals.fundraising_in_market.mix.equity_usd)}, debt ~${formatBillions(model.public_signals.fundraising_in_market.mix.debt_usd)}); Nvidia up to $2B (reported) · as of ${fundraiseAsOf}`;
  const modelNames = model.public_signals.models.map((entry) => entry.name).join(" / ");
  const fastNote = model.public_signals.models.find((entry) => entry.name.toLowerCase().includes("fast"))?.note;
  const modelDetails = `${modelNames}${fastNote ? ` (${fastNote})` : ""}`;
  const userRange = formatUserRange(model.public_signals.users_estimate.maus_min, model.public_signals.users_estimate.maus_max);
  const usersDetails = `MAUs ~${userRange} (estimates; not official) · as of ${formatAsOfDate(model.public_signals.users_estimate.as_of)}`;
  const worldDetails = `Target: ${model.public_signals.world_model_plan.target}; ${model.public_signals.world_model_plan.hires ?? "hires in flight"} (reports)`;

  const computeSources: TooltipSource[] = [];
  if (sources.colossus && typeof sources.colossus === "string") {
    computeSources.push({ url: sources.colossus, label: "xAI · Colossus (official site)" });
  }
  const fundraiseSources: TooltipSource[] = [];
  if (sources.raise_20b && typeof sources.raise_20b === "string") {
    fundraiseSources.push({ url: sources.raise_20b, label: "Reuters · $20B raise (reported)" });
  }
  if (sources.denial_200b && typeof sources.denial_200b === "string") {
    fundraiseSources.push({ url: sources.denial_200b, label: "Yahoo Finance · Musk comment (not closed)" });
  }
  const modelSources: TooltipSource[] = [];
  if (sources.grok4_fast && typeof sources.grok4_fast === "string") {
    modelSources.push({ url: sources.grok4_fast, label: "xAI · Grok 4 Fast (official)" });
  }
  const userSources: TooltipSource[] = [];
  if (sources.maus_estimates_1 && typeof sources.maus_estimates_1 === "string") {
    userSources.push({ url: sources.maus_estimates_1, label: "Exploding Topics · MAU estimate" });
  }
  if (sources.maus_estimates_2 && typeof sources.maus_estimates_2 === "string") {
    userSources.push({ url: sources.maus_estimates_2, label: "DemandSage · MAU estimate" });
  }
  const worldSources: TooltipSource[] = [];
  if (sources.world_models && typeof sources.world_models === "string") {
    worldSources.push({ url: sources.world_models, label: "Financial Times · world models roadmap" });
  }

  return (
    <TooltipProvider>
      <section className="space-y-6 rounded-3xl border border-sky-100 bg-gradient-to-b from-white via-white/90 to-sky-50/40 p-6 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.4)]">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Investor Mode · last updated {model.company_meta.last_updated}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">xAI Fund Model (Scenario)</h2>
        <p className="text-sm text-slate-600">
          Public signals are sourced from xAI announcements and coverage. Scenario fields update as diligence progresses.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Public signals</CardTitle>
          <CardDescription>Facts reported by xAI or credible coverage.</CardDescription>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <PublicPill
            title="Compute"
            details={computeDetails}
            badge="official"
            sources={computeSources}
          />
          <PublicPill
            title="Fundraise"
            details={fundraiseDetails}
            badge="reported"
            sources={fundraiseSources}
          />
          <PublicPill
            title="Models"
            details={modelDetails}
            badge="official"
            sources={modelSources}
          />
          <PublicPill
            title="Users"
            details={usersDetails}
            badge="estimate"
            sources={userSources}
          />
          <PublicPill
            title="World models"
            details={worldDetails}
            badge="reported"
            sources={worldSources}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investment summary</CardTitle>
          <CardDescription>Scenario inputs; update when term sheet is finalized.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Entry valuation (USD)
            <Input
              value={entryValuation != null ? formatInputValue(entryValuation) : ""}
              onChange={(event) => setEntryValuation(parseCurrency(event.target.value))}
              placeholder="Enter when available"
              inputMode="decimal"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Ownership %
            <Input
              value={ownershipPct != null ? formatNumberInput(ownershipPct) : ""}
              onChange={(event) => setOwnershipPct(parseCurrency(event.target.value))}
              placeholder="Enter when available"
              inputMode="decimal"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          When deal terms finalize, these fields auto-populate from <code>xai_fund_model.json</code>.
        </p>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Market cap calculator</CardTitle>
            <CardDescription>Revenue is scenario-only; xAI does not disclose run-rate.</CardDescription>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-600 hover:border-sky-300"
            onClick={() => setProjectionsEditing((prev) => !prev)}
          >
            <Edit3 className="h-3.5 w-3.5" aria-hidden />
            {projectionsEditing ? "Finish editing" : "Edit projections"}
          </button>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_1fr]">
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Year
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                <span>EV/Sales multiple</span>
                <span>{multiple.toFixed(0)}×</span>
              </div>
              <Slider
                value={[multiple]}
                min={10}
                max={30}
                step={1}
                onValueChange={(value) => setMultiple(value[0] ?? multiple)}
                aria-label="EV to Sales multiple"
              />
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Revenue run rate (USD)
              {baseRunRate !== null && !projectionsEditing ? (
                <div className="rounded-xl border border-sky-100 bg-white/70 px-3 py-2 text-sm text-slate-600">
                  {formatUSDShort(baseRunRate)} <span className="text-xs text-slate-500">(reported/estimate)</span>
                </div>
              ) : (
                <Input
                  value={revenueRunRate != null ? formatInputValue(revenueRunRate) : ""}
                  onChange={(event) => handleRevenueChange(year, event.target.value, setCustomRevenues)}
                  placeholder="Enter estimate"
                  inputMode="decimal"
                />
              )}
            </label>
            <div className="rounded-2xl border border-sky-100 bg-white/70 p-4" aria-live="polite">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Implied market cap</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {marketCap !== null ? formatUSDShort(marketCap) : "N/A"}
              </p>
              <p className="text-xs text-slate-500">
                {marketCap !== null
                  ? `${multiple.toFixed(0)}× EV/Sales × ${formatUSDShort(revenueRunRate!)} revenue run rate`
                  : "Scenario — enter a revenue estimate to compute market cap."}
              </p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiples.map((m) => ({ multiple: m, value: (revenueRunRate ?? 0) * m }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                <XAxis dataKey="multiple" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis hide domain={[0, "dataMax"]} />
                <RechartsTooltip
                  cursor={{ fill: "rgba(14,165,233,0.08)" }}
                  formatter={(value: number) => formatUSDShort(value)}
                  labelFormatter={(label) => `${label}× EV/Sales`}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {multiples.map((m) => (
                    <Cell key={m} fill={m === multiple ? "#0284c7" : "rgba(2,132,199,0.35)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-slate-500">
              {revenueRunRate !== null
                ? `At ${multiple.toFixed(0)}× EV/Sales and ${formatUSDShort(revenueRunRate)} run rate, market cap ≈ ${formatUSDShort(marketCap!)}.`
                : "Provide a revenue estimate to illustrate potential market cap."}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waterfall returns</CardTitle>
          <CardDescription>
            Ownership-based when available; otherwise choose a scenario gross multiple.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700">
              Commitment (USD)
              <Input
                value={formatInputValue(commitment)}
                onChange={(event) => setCommitment(parseCurrency(event.target.value) ?? 0)}
                inputMode="decimal"
                aria-label="Commitment in USD"
              />
            </label>
            {!useOwnershipPath ? (
              <div className="space-y-2 text-sm font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Scenario gross MoM</span>
                  <span>{grossMoM.toFixed(2)}×</span>
                </div>
                <Slider
                  value={[grossMoM]}
                  min={1}
                  max={10}
                  step={0.1}
                  onValueChange={(value) => setGrossMoM(value[0] ?? grossMoM)}
                  aria-label="Gross MoM multiplier"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Ownership path active ({ownershipPct?.toFixed(2) ?? "?"}% of exit). Gross multiple slider disabled.
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-700">
                Mgmt fee {formatScenarioPct(mgmtFee)}
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-700">
                Carry {formatScenarioPct(carryPct)}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-sky-100">
              <table className="min-w-full text-sm text-slate-700">
                <tbody className="divide-y divide-slate-100">
                  <Row label="Invested after fees" value={formatUSDShort(invested)} />
                  <Row label="Total gross proceeds" value={formatUSDShort(gross)} />
                  <Row label="Gross profit" value={formatUSDShort(grossProfit)} />
                  <Row label="JBV carry" value={formatUSDShort(carry)} />
                  <Row label="Net to investors" value={formatUSDShort(net)} />
                  <Row label="Net MoM" value={`${netMoM.toFixed(2)}×`} />
                </tbody>
              </table>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Waterfall",
                      Invested: invested,
                      Carry: carry,
                      Net: Math.max(net - carry, 0)
                    }
                  ]}
                  layout="vertical"
                  stackOffset="expand"
                >
                  <XAxis type="number" hide domain={[0, 1]} />
                  <YAxis type="category" dataKey="name" hide />
                  <RechartsTooltip
                    formatter={(value: number, name) => [formatUSDShort(value), name]}
                    cursor={{ fill: "rgba(2,132,199,0.08)" }}
                  />
                  <Bar dataKey="Invested" stackId="a" fill="#0ea5e9" radius={[12, 0, 0, 12]} />
                  <Bar dataKey="Carry" stackId="a" fill="#38bdf8" />
                  <Bar dataKey="Net" stackId="a" fill="#bae6fd" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500">
              Ownership path uses market cap × ownership %. Otherwise, MoM slider drives scenario returns.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>xAI projections</CardTitle>
            <CardDescription>Enter or toggle revenue projections to visualize growth scenarios.</CardDescription>
          </div>
          <div className="inline-flex rounded-full border border-sky-200 bg-white p-1">
            {(["abs", "yoy"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setProjectionMode(option)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  projectionMode === option ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:text-sky-600"
                )}
              >
                {option === "abs" ? "Absolute" : "YoY %"}
              </button>
            ))}
          </div>
        </CardHeader>
        {hasProjectionValues ? (
          <div className="space-y-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectionSeries}
                  margin={{ left: 0, right: 12, top: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) =>
                      projectionMode === "abs" ? formatUSDShort(value) : formatPct(value, { sign: true })
                    }
                  />
                  <RechartsTooltip content={renderProjectionTooltip(projectionMode)} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2.2}
                    dot={{ r: 3, stroke: "#0ea5e9", strokeWidth: 1, fill: "white" }}
                    isAnimationActive={!prefersReducedMotion}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500">
              {projectionMode === "abs"
                ? `${year} run-rate revenue ≈ ${revenueRunRate ? formatUSDShort(revenueRunRate) : "N/A"}.`
                : `${year} growth ${selectedProjection.isNull ? "—" : formatPct(selectedProjection.value, { sign: true })}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 rounded-2xl border border-sky-100 bg-white/70 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">Add revenue projections</p>
            <p className="text-xs text-slate-500">
              xAI has not disclosed revenue. Enter scenario run-rate estimates below to unlock charts.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {model.market_cap_calculator.map((item) => (
                <label key={item.year} className="text-xs font-medium text-slate-600">
                  {item.year}
                  <Input
                    className="mt-1"
                    value={customRevenues[item.year] != null ? formatInputValue(customRevenues[item.year]) : ""}
                    onChange={(event) => handleRevenueChange(item.year, event.target.value, setCustomRevenues)}
                    placeholder="USD"
                    inputMode="decimal"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peer comparables</CardTitle>
          <CardDescription>Contextual peers; click through to available microsites.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {model.market_comps.map((comp) => (
            <div key={comp.company} className="rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{comp.company}</p>
                {peerLink(comp.company) ? (
                  <Link
                    href={peerLink(comp.company)!}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    View ↗
                  </Link>
                ) : null}
              </div>
              {comp.note ? <p className="mt-2 text-xs text-slate-500">{comp.note}</p> : null}
            </div>
          ))}
        </div>
      </Card>

      <footer className="space-y-2 rounded-2xl border border-slate-200 bg-white/85 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Sources</p>
        <ol className="list-decimal space-y-1 pl-5">
          {Object.entries(sources).map(([key, url]) => (
            <li key={key}>
              <span className="font-semibold uppercase tracking-wide text-slate-500">{key.replace(/_/g, " ")}: </span>
              <Link href={url as string} target="_blank" rel="noopener" className="text-sky-600 hover:text-sky-700">
                {url as string}
              </Link>
            </li>
          ))}
        </ol>
      </footer>
    </section>
    </TooltipProvider>
  );
}

function PublicPill({
  title,
  details,
  badge,
  sources
}: {
  title: string;
  details: string;
  badge: string;
  sources?: TooltipSource[];
}) {
  const baseClasses =
    "flex flex-col gap-1 rounded-2xl border border-sky-100 bg-white/70 p-4 text-left shadow-[0_20px_60px_-50px_rgba(15,23,42,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300";

  const content = (
    <>
      <span className="inline-flex w-fit items-center rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
        {badge}
      </span>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-600">{details}</p>
    </>
  );

  if (!sources?.length) {
    return <div className={baseClasses}>{content}</div>;
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`${baseClasses} transition hover:-translate-y-0.5`}
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent className="space-y-2" align="start">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Sources</p>
        <ul className="space-y-1">
          {sources.map(({ url, label }) => (
            <li key={url}>
              <Link
                href={url}
                target="_blank"
                rel="noopener"
                className="text-sky-600 hover:text-sky-700"
              >
                {label ?? deriveSourceLabel(url)}
              </Link>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="px-4 py-2 text-slate-500">{label}</td>
      <td className="px-4 py-2 text-right font-semibold text-slate-800">{value}</td>
    </tr>
  );
}

function handleRevenueChange(
  year: number,
  raw: string,
  setCustomRevenues: React.Dispatch<React.SetStateAction<Record<number, number>>>
) {
  const parsed = parseCurrency(raw);
  setCustomRevenues((prev) => {
    const next = { ...prev };
    if (parsed === null || Number.isNaN(parsed)) {
      delete next[year];
    } else {
      next[year] = parsed;
    }
    return next;
  });
}

function parseCurrency(input: string) {
  const digits = input.replace(/[^\d.]/g, "");
  return digits ? Number.parseFloat(digits) : null;
}

function formatInputValue(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatNumberInput(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function renderProjectionTooltip(mode: "abs" | "yoy") {
  const displayName = mode === "abs" ? "AbsProjectionTooltip" : "YoyProjectionTooltip";

  function ProjectionTooltipContent({ payload }: { payload?: TooltipPayload[] }) {
    if (!payload || payload.length === 0) return null;
    const datum = payload[0].payload;
    const label = mode === "abs" ? "Run rate" : "YoY";
    const display = datum.isNull
      ? "—"
      : mode === "abs"
        ? formatUSDShort(datum.value)
        : formatPct(datum.value, { sign: true });

    return (
      <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        <p className="font-semibold text-slate-700">{datum.year}</p>
        <p>
          {label}: {display}
        </p>
      </div>
    );
  }

  ProjectionTooltipContent.displayName = displayName;

  return ProjectionTooltipContent;
}

function peerLink(company: string): string | null {
  const map: Record<string, string | null> = {
    OpenAI: "/openai",
    Anthropic: "/anthropic",
    "Mistral AI": null
  };
  return map[company] ?? null;
}
