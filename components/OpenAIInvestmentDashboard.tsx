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
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TooltipProps } from "recharts";
import { ExternalLink } from "lucide-react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { type FundModel } from "@/lib/openaiFundModel";
import { formatPct, formatUSDShort, netToInvestors } from "@/lib/format";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "jbv:openai:fundmodel:v1";

type PersistedState = {
  year: number;
  multiple: number;
  commitment: number;
};

interface OpenAIInvestmentDashboardProps {
  fundModel?: FundModel | null;
}

export default function OpenAIInvestmentDashboard({ fundModel }: OpenAIInvestmentDashboardProps) {
  const prefersReducedMotion = useReducedMotion();

  const fallbackModel: FundModel = {
    investment_summary: {
      jbv_interest_usd: 0,
      expense_fee_usd: 0,
      broker_fee_usd: 0,
      purchase_price_usd: 0,
      valuation_cap_usd: 1,
      implied_cost_basis_usd: 1
    },
    market_cap_calculator: [{ year: 2025, revenue_run_rate_usd: 0 }],
    waterfall: {
      commitment_default_usd: 1_000_000,
      jbv_mgmt_fee_pct: 0.05,
      gross_mom_multiple: 1,
      jbv_carry_pct: 0.1
    },
    market_comps: [{ company: "Placeholder", yoy_growth_pct: 0, ev_to_sales: 1 }],
    sources: {},
    last_updated: new Date().toISOString().split("T")[0]
  };

  const model = fundModel ?? fallbackModel;
  const hasData = Boolean(fundModel);

  const defaultYear = model.market_cap_calculator[0]?.year ?? 2025;
  const defaultCommitment = model.waterfall.commitment_default_usd ?? 1_000_000;

  const [year, setYear] = useState<number>(defaultYear);
  const [multiple, setMultiple] = useState<number>(25);
  const [commitment, setCommitment] = useState<number>(defaultCommitment);
  const [projectionMode, setProjectionMode] = useState<"abs" | "yoy">("abs");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as PersistedState;
      if (saved.year) setYear(saved.year);
      if (saved.multiple) setMultiple(saved.multiple);
      if (saved.commitment) setCommitment(saved.commitment);
    } catch (error) {
      console.warn("[openai-fund-model] unable to restore state", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = { year, multiple, commitment };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [year, multiple, commitment]);

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
  const marketCap = selectedYearData.revenue_run_rate_usd * multiple;

  const multiples = useMemo(() => Array.from({ length: 21 }, (_, index) => 10 + index), []);

  const waterfallResult = useMemo(() => {
    return netToInvestors(
      commitment,
      model.waterfall.jbv_mgmt_fee_pct,
      model.waterfall.gross_mom_multiple,
      model.waterfall.jbv_carry_pct
    );
  }, [commitment, model.waterfall]);

  type ProjectionDatum = { year: number; value: number; isNull: boolean };

  const projectionData = useMemo<ProjectionDatum[]>(() => {
    if (projectionMode === "abs") {
      return model.market_cap_calculator.map((item) => ({
        year: item.year,
        value: item.revenue_run_rate_usd,
        isNull: false
      }));
    }
    let previous: number | null = null;
    return model.market_cap_calculator.map((item) => {
      const yoy = previous ? ((item.revenue_run_rate_usd - previous) / previous) * 100 : null;
      previous = item.revenue_run_rate_usd;
      return {
        year: item.year,
        value: yoy ?? 0,
        isNull: yoy === null
      };
    });
  }, [model.market_cap_calculator, projectionMode]);

  const selectedProjection = projectionData.find((item) => item.year === year) ?? projectionData[0];

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

  return (
    <section className="space-y-6 rounded-3xl border border-sky-100 bg-gradient-to-b from-white via-white/90 to-sky-50/40 p-6 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.4)]">
      <header className="space-y-2 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Investor Mode · last updated {model.last_updated}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">OpenAI Fund Model (JBV)</h2>
        <p className="text-sm text-slate-600">
          Figures mirror the JBV “OpenAI Model” sheet; update values by editing <code>openai_fund_model.json</code>.
        </p>
      </header>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Investment summary</CardTitle>
            <CardDescription>Snapshot of the proposed OpenAI secondary purchase.</CardDescription>
          </div>
          <Link
            href="#sources"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Sources <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-2 text-sm text-slate-700">
            <SummaryItem label="JBV OpenAI Interest" value={formatUSDShort(model.investment_summary.jbv_interest_usd)} />
            <SummaryItem label="Expense Fee" value={formatUSDShort(model.investment_summary.expense_fee_usd)} />
            <SummaryItem label="Broker Fee" value={formatUSDShort(model.investment_summary.broker_fee_usd)} />
            <SummaryItem label="All-in Purchase Price" value={formatUSDShort(model.investment_summary.purchase_price_usd)} />
          </ul>
          <ul className="space-y-2 text-sm text-slate-700">
            <SummaryItem label="Valuation Cap" value={formatUSDShort(model.investment_summary.valuation_cap_usd)} />
            <SummaryItem label="Implied Cost Basis" value={formatUSDShort(model.investment_summary.implied_cost_basis_usd)} />
          </ul>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market cap calculator</CardTitle>
          <CardDescription>Select revenue run rate and EV/Sales to approximate terminal valuation.</CardDescription>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
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
            <div className="rounded-2xl border border-sky-100 bg-white/70 p-4" aria-live="polite">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-600">Implied market cap</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatUSDShort(marketCap)}
              </p>
              <p className="text-xs text-slate-500">
                {multiple.toFixed(0)}× EV/Sales × {formatUSDShort(selectedYearData.revenue_run_rate_usd)} revenue run rate
              </p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiples.map((m) => ({ multiple: m, value: selectedYearData.revenue_run_rate_usd * m }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                <XAxis dataKey="multiple" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis hide domain={[0, "dataMax"]} />
                <Tooltip
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
              At {multiple.toFixed(0)}× EV/Sales and ${selectedYearData.revenue_run_rate_usd.toLocaleString()} run rate, market cap ≈ {formatUSDShort(marketCap)}.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waterfall returns calculator</CardTitle>
          <CardDescription>Adjust commitment to evaluate net outcomes after fees and carry.</CardDescription>
        </CardHeader>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
          <div className="space-y-4">
            <label className="text-sm font-medium text-slate-700">
              Commitment (USD)
              <Input
                value={formatInputValue(commitment)}
                onChange={(event) => setCommitment(parseCurrency(event.target.value) || 0)}
                inputMode="decimal"
                aria-label="Commitment in USD"
              />
            </label>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <Badge label="Mgmt fee" value={formatPct(model.waterfall.jbv_mgmt_fee_pct * 100)} />
              <Badge label="Gross MoM" value={`${model.waterfall.gross_mom_multiple.toFixed(2)}×`} />
              <Badge label="Carry" value={formatPct(model.waterfall.jbv_carry_pct * 100)} />
          </div>
        </div>
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-sky-100">
              <table className="min-w-full text-sm text-slate-700">
                <tbody className="divide-y divide-slate-100">
                  <Row label="Invested after fees" value={formatUSDShort(waterfallResult.invested)} />
                  <Row label="Total gross proceeds" value={formatUSDShort(waterfallResult.gross)} />
                  <Row label="Gross profit" value={formatUSDShort(waterfallResult.grossProfit)} />
                  <Row label="JBV carry" value={formatUSDShort(waterfallResult.carry)} />
                  <Row label="Net to investors" value={formatUSDShort(waterfallResult.net)} />
                  <Row label="Net MoM" value={`${waterfallResult.netMoM.toFixed(2)}×`} />
                </tbody>
              </table>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Returns",
                      Invested: waterfallResult.invested,
                      Carry: waterfallResult.carry,
                      Net: waterfallResult.net - waterfallResult.carry
                    }
                  ]}
                  layout="vertical"
                  stackOffset="expand"
                >
                  <XAxis type="number" hide domain={[0, 1]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    formatter={(value: number, name) => [formatUSDShort(value), name]}
                    cursor={{ fill: "rgba(2,132,199,0.08)" }}
                  />
                  <Bar dataKey="Invested" stackId="a" fill="#0ea5e9" radius={[12, 0, 0, 12]} />
                  <Bar dataKey="Carry" stackId="a" fill="#38bdf8" />
                  <Bar dataKey="Net" stackId="a" fill="#bae6fd" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-slate-500">
                Distribution of invested capital, carry, and net returns at the modeled gross multiple.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>OpenAI projections</CardTitle>
            <CardDescription>Run-rate revenue outlook from the fund model.</CardDescription>
          </div>
          <div className="inline-flex rounded-full border border-sky-200 bg-white p-1">
            {(["abs", "yoy"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setProjectionMode(option)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  projectionMode === option
                    ? "bg-sky-600 text-white shadow"
                    : "text-slate-500 hover:text-sky-600"
                )}
              >
                {option === "abs" ? "Absolute" : "YoY %"}
              </button>
            ))}
          </div>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
              <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => labelFormatter(value, projectionMode)} />
              <Tooltip content={renderProjectionTooltip(projectionMode)} />
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
        <p className="mt-2 text-xs text-slate-500">
          {projectionMode === "abs"
            ? `${selectedProjection.year} run-rate revenue approximates ${formatUSDShort(selectedProjection.value ?? 0)}.`
            : `${selectedProjection.year} growth ${selectedProjection.value === null ? "—" : formatPct(selectedProjection.value, { sign: true })}.`}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market comparables</CardTitle>
          <CardDescription>Illustrative EV/Sales and growth metrics from the fund model sheet.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {model.market_comps.map((comp) => (
            <div
              key={comp.company}
              className="rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)]"
            >
              <p className="text-sm font-semibold text-slate-800">{comp.company}</p>
              <div className="mt-3 flex flex-col gap-2 text-xs">
                <span className={cn("inline-flex w-fit items-center rounded-full px-3 py-1 font-semibold",
                  getGrowthBadgeClasses(comp.yoy_growth_pct)
                )}>
                  YoY {formatPct(comp.yoy_growth_pct, { sign: true })}
                </span>
                <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                  EV/Sales {comp.ev_to_sales}×
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Illustrative peer metrics; refresh monthly alongside the sheet.
              </p>
            </div>
          ))}
        </div>
      </Card>

      <footer id="sources" className="space-y-2 rounded-2xl border border-slate-200 bg-white/85 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Sources</p>
        <ol className="list-decimal space-y-1 pl-5">
          {Object.entries(model.sources as Record<string, string>).map(([key, url]) => (
            <li key={key}>
              <span className="font-semibold uppercase tracking-wide text-slate-500">{key.replace(/_/g, " ")}: </span>
              <Link href={url} target="_blank" rel="noopener" className="text-sky-600 hover:text-sky-700">
                {url}
              </Link>
            </li>
          ))}
        </ol>
      </footer>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </li>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700">
      {label}: {value}
    </span>
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

function labelFormatter(value: number | null, mode: "abs" | "yoy") {
  if (value === null) return "—";
  return mode === "abs" ? formatUSDShort(value) : formatPct(value, { sign: true });
}

function getGrowthBadgeClasses(value: number) {
  if (value >= 100) return "bg-emerald-50 text-emerald-700";
  if (value >= 0) return "bg-sky-50 text-sky-700";
  return "bg-rose-50 text-rose-700";
}

function formatInputValue(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function parseCurrency(input: string) {
  const digits = input.replace(/[^\d.]/g, "");
  return digits ? Number.parseFloat(digits) : null;
}

type TooltipPayload = {
  payload: { year: number; value: number; isNull?: boolean };
};

function renderProjectionTooltip(mode: "abs" | "yoy") {
  return (({ payload }: { payload?: TooltipPayload[] }) => {
    if (!payload || payload.length === 0) return null;
    const datum = payload[0].payload as { year: number; value: number; isNull?: boolean };
    const label = mode === "abs" ? "Run rate" : "YoY";
    const display = datum.isNull
      ? "—"
      : mode === "abs"
        ? formatUSDShort(datum.value)
        : formatPct(datum.value, { sign: true });

    return (
      <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        <p className="font-semibold text-slate-700">{datum.year}</p>
        <p>{label}: {display}</p>
      </div>
    );
  }) as TooltipProps<number, string>["content"];
}
