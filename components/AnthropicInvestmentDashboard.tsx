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
import { ExternalLink, Info } from "lucide-react";

import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import type { AnthFundModel } from "@/lib/anthropicFundModel";
import {
  formatPct,
  formatUSDShort,
  grossProceeds,
  investedAfterFee,
  jbvCarry
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

const STORAGE_KEY = "jbv:anthropic:fundmodel:v1";

const formatScenarioPct = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatPct(value * 100, { sign: true });
};

const MULTIPLE_MIN = 10;
const MULTIPLE_MAX = 30;
const MOM_MIN = 1;
const MOM_MAX = 10;

const peerRoute: Record<string, string | null> = {
  OpenAI: "/openai",
  xAI: "/xai",
  "Mistral AI": null
};

type PersistedState = {
  year: number;
  multiple: number;
  commitment: number;
  entryValuation: number | null;
  ownershipPct: number | null;
  grossMoM: number;
  projectionMode?: "abs" | "yoy";
};

type AnthropicInvestmentDashboardProps = {
  fundModel?: AnthFundModel | null;
};

type ProjectionDatum = { year: number; value: number; isNull: boolean };

type TooltipDatum = {
  payload: ProjectionDatum;
};

type ProjectionTooltipProps = { payload?: TooltipDatum[] };


type KPIItem = {
  label: string;
  value: string;
  badge: string;
  tooltipSources: { key: string; url: string }[];
  description?: string;
  hrefs?: { label: string; url: string }[];
};

export default function AnthropicInvestmentDashboard({ fundModel }: AnthropicInvestmentDashboardProps) {
  const prefersReducedMotion = useReducedMotion();

  const fallbackModel: AnthFundModel = {
    company_meta: {
      name: "Anthropic",
      mission: "",
      tagline: "",
      last_updated: new Date().toISOString().split("T")[0]
    },
    public_kpis: {
      valuation_post_money_usd: 1,
      valuation_as_of: "",
      arr_run_rate_usd: 1,
      arr_as_of: ""
    },
    distribution_partners: [],
    models: [],
    safety: { headline: "", source: "" },
    funding_context: {
      series_f_usd: 1,
      post_money_usd: 1,
      as_of: "",
      strategics: []
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
        ownership_pct: null
      }
    },
    market_cap_calculator: [{ year: new Date().getFullYear(), revenue_run_rate_usd: 1 }],
    market_comps: [],
    sources: {}
  };

  const model = fundModel ?? fallbackModel;
  const hasData = Boolean(fundModel);

  const defaultYear = model.market_cap_calculator[0]?.year ?? new Date().getFullYear();
  const defaultCommitment = model.investment_scenarios.defaults.commitment_usd;

  const [year, setYear] = useState<number>(defaultYear);
  const [multiple, setMultiple] = useState<number>(25);
  const [commitment, setCommitment] = useState<number>(defaultCommitment);
  const [entryValuation, setEntryValuation] = useState<number | null>(
    model.investment_scenarios.entry.entry_valuation_usd
  );
  const [ownershipPct, setOwnershipPct] = useState<number | null>(
    model.investment_scenarios.entry.ownership_pct
  );
  const [grossMoM, setGrossMoM] = useState<number>(3);
  const [projectionMode, setProjectionMode] = useState<"abs" | "yoy">("abs");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as PersistedState;
      if (typeof parsed.year === "number") setYear(parsed.year);
      if (typeof parsed.multiple === "number") setMultiple(parsed.multiple);
      if (typeof parsed.commitment === "number") setCommitment(parsed.commitment);
      if (parsed.entryValuation !== undefined) setEntryValuation(parsed.entryValuation);
      if (parsed.ownershipPct !== undefined) setOwnershipPct(parsed.ownershipPct);
      if (typeof parsed.grossMoM === "number") setGrossMoM(parsed.grossMoM);
      if (parsed.projectionMode) setProjectionMode(parsed.projectionMode);
    } catch (error) {
      console.warn("[anthropic-fund-model] unable to restore state", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedState = {
      year,
      multiple,
      commitment,
      entryValuation,
      ownershipPct,
      grossMoM,
      projectionMode
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [year, multiple, commitment, entryValuation, ownershipPct, grossMoM, projectionMode]);

  useEffect(() => {
    if (!hasData) return;
    const years = model.market_cap_calculator.map((item) => item.year);
    if (!years.includes(year)) {
      setYear(years[0]);
    }
  }, [hasData, model, year]);

  const years = model.market_cap_calculator.map((item) => item.year);
  const selectedYearData =
    model.market_cap_calculator.find((item) => item.year === year) ?? model.market_cap_calculator[0];
  const revenueRunRate = selectedYearData.revenue_run_rate_usd;
  const marketCap = revenueRunRate * multiple;

  const multiples = useMemo(() => {
    return Array.from({ length: MULTIPLE_MAX - MULTIPLE_MIN + 1 }, (_, index) => MULTIPLE_MIN + index);
  }, []);

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

  const selectedProjection =
    projectionData.find((item) => item.year === year) ?? projectionData[0] ?? { year, value: 0, isNull: true };

  const mgmtFeePct = model.investment_scenarios.defaults.mgmt_fee_pct;
  const carryPct = model.investment_scenarios.defaults.carry_pct;

  const ownershipValue = ownershipPct ?? null;
  const hasOwnership = ownershipValue != null && !Number.isNaN(ownershipValue) && ownershipValue > 0;

  const invested = investedAfterFee(commitment, mgmtFeePct);
  const grossFromOwnership = hasOwnership ? marketCap * ownershipValue : null;
  const gross = hasOwnership ? grossFromOwnership! : grossProceeds(invested, grossMoM);
  const grossProfit = gross - invested;
  const carry = jbvCarry(grossProfit, carryPct);
  const net = gross - carry;
  const netMoM = commitment > 0 ? net / commitment : 0;

  const kpiRow: KPIItem[] = useMemo(() => {
    const sources = model.sources ?? {};
    const entries = Object.entries(sources);
    const getSources = (...keys: string[]) =>
      keys
        .map((key) => ({ key, url: sources[key] as string | undefined }))
        .filter((item): item is { key: string; url: string } => Boolean(item.url));
    const findSourceKey = (url: string, fallback: string) => {
      const match = entries.find(([, value]) => value === url);
      return match ? match[0] : fallback;
    };
    return [
      {
        label: "Valuation (post)",
        value: `$${(model.public_kpis.valuation_post_money_usd / 1_000_000_000).toFixed(0)}B`,
        badge: `As of ${model.public_kpis.valuation_as_of}`,
        tooltipSources: getSources("series_f_183b_and_arr_5b")
      },
      {
        label: "ARR run-rate",
        value: `>$${(model.public_kpis.arr_run_rate_usd / 1_000_000_000).toFixed(0)}B`,
        badge: `As of ${model.public_kpis.arr_as_of}`,
        tooltipSources: getSources("series_f_183b_and_arr_5b")
      },
      {
        label: "Distribution",
        value: model.distribution_partners.map((partner) => partner.name).join(" / ") || "Scenario",
        badge: "Hyperscaler GTM",
        tooltipSources: model.distribution_partners.map((partner) => ({
          key: findSourceKey(partner.link, partner.name),
          url: partner.link
        })),
        hrefs: model.distribution_partners.map((partner) => ({
          label: partner.name,
          url: partner.link
        }))
      },
      {
        label: "Safety",
        value: model.safety.headline || "Scenario",
        badge: "Alignment",
        tooltipSources: model.safety.source
          ? [
              {
                key: findSourceKey(model.safety.source, "constitutional_ai"),
                url: model.safety.source
              }
            ]
          : []
      }
    ];
  }, [model]);

  const sourcesEntries = useMemo(() => Object.entries(model.sources ?? {}), [model.sources]);

  return (
    <section
      className="space-y-6 rounded-3xl border border-sky-100 bg-gradient-to-b from-white via-white/90 to-sky-50/40 p-6 shadow-[0_40px_120px_-70px_rgba(15,23,42,0.35)]"
      aria-label="Anthropic fund model dashboard"
    >
      <header className="space-y-1 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
          Investor Mode · last updated {model.company_meta.last_updated}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">Anthropic Fund Model</h2>
        <p className="text-sm text-slate-600">
          Figures reference verified public disclosures. Scenario fields remain editable for diligence.
        </p>
      </header>

      <TooltipProvider>
        <div className="grid gap-3 md:grid-cols-4">
          {kpiRow.map((item) => (
            <KpiPill key={item.label} item={item} />
          ))}
        </div>
      </TooltipProvider>

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Investment summary</CardTitle>
            <CardDescription>Configure entry terms once negotiated; defaults reflect scenario placeholders.</CardDescription>
          </div>
          {model.investment_scenarios.entry.note ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Info className="h-3.5 w-3.5" aria-hidden />
              {model.investment_scenarios.entry.note}
            </Badge>
          ) : null}
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Entry valuation (USD)
              <Input
                inputMode="decimal"
                value={entryValuation != null ? formatNumberInput(entryValuation) : ""}
                onChange={(event) => {
                  const parsed = parseCurrency(event.target.value);
                  setEntryValuation(parsed);
                }}
                placeholder="Scenario"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Ownership %
              <Input
                inputMode="decimal"
                value={ownershipPct != null ? formatNumberInput(ownershipPct * 100) : ""}
                onChange={(event) => {
                  const parsed = parseCurrency(event.target.value);
                  setOwnershipPct(parsed === null ? null : parsed / 100);
                }}
                placeholder="Scenario"
              />
            </label>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <Badge variant="outline">Mgmt fee {formatScenarioPct(mgmtFeePct)}</Badge>
              <Badge variant="outline">Carry {formatScenarioPct(carryPct)}</Badge>
            </div>
          </div>
          <ul className="grid gap-2 text-sm text-slate-600">
            <SummaryItem label="Scenario commitment" value={formatUSDShort(commitment)} />
            <SummaryItem label="Post-money reference" value={formatUSDShort(model.funding_context.post_money_usd)} />
            <SummaryItem label="Strategics" value={strategicsDisplay(model.funding_context.strategics)} />
            <SummaryItem label="Models" value={model.models.map((m) => m.name).join(", ") || "—"} />
          </ul>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Market cap calculator</CardTitle>
            <CardDescription>Select disclosed run rates and apply EV/Sales to infer valuation scenarios.</CardDescription>
          </div>
          <Link href="#sources" className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 hover:text-sky-700">
            Sources <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Year
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={year}
                onChange={(event) => setYear(Number.parseInt(event.target.value, 10))}
              >
                {years.map((optionYear) => (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <span>EV / Sales</span>
                <span>{multiple.toFixed(0)}×</span>
              </div>
              <Slider
                value={[multiple]}
                min={MULTIPLE_MIN}
                max={MULTIPLE_MAX}
                step={1}
                onValueChange={([value]) => setMultiple(value)}
                className="w-full"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-800">Run-rate revenue</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatUSDShort(revenueRunRate)}
              </p>
              <p className="text-xs text-slate-500">Auto-sourced from projections for {year}.</p>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Market cap scenario
              </p>
              <p className="text-3xl font-semibold text-slate-900" aria-live="polite">
                {formatUSDShort(marketCap)}
              </p>
              <p className="text-xs text-slate-500">
                {projectionMode === "abs"
                  ? `${year} run-rate revenue ≈ ${formatUSDShort(revenueRunRate)}.`
                  : `${year} YoY growth ${selectedProjection.isNull ? "—" : formatPct(selectedProjection.value, { sign: true })}.`}
              </p>
            </div>
            <div
              className="h-48 rounded-2xl border border-slate-200 bg-white/70 p-4"
              aria-label={`EV to Sales distribution for multiples between ${MULTIPLE_MIN} and ${MULTIPLE_MAX}. Selected multiple ${multiple.toFixed(0)}×.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiples.map((value) => ({ multiple: value, marketCap: revenueRunRate * value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="multiple" stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(14,165,233,0.12)" }}
                    formatter={(value: number) => formatUSDShort(value)}
                    labelFormatter={(label) => `${label}×`}
                  />
                  <Bar dataKey="marketCap" radius={[8, 8, 0, 0]}>
                    {multiples.map((value) => (
                      <Cell
                        key={value}
                        fill={value === multiple ? "#0EA5E9" : "rgba(14,165,233,0.35)"}
                        className={cn({ "transition-all duration-500": !prefersReducedMotion })}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waterfall returns</CardTitle>
          <CardDescription>Assess net proceeds after fees and carry using either ownership or gross MoM.</CardDescription>
        </CardHeader>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Commitment
              <Input
                inputMode="decimal"
                value={formatNumberInput(commitment)}
                onChange={(event) => {
                  const parsed = parseCurrency(event.target.value);
                  setCommitment(parsed ?? model.investment_scenarios.defaults.commitment_usd);
                }}
              />
            </label>
            {hasOwnership ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                Ownership path active. Gross proceeds derived from {formatPct((ownershipValue ?? 0) * 100)} ownership ×
                {" "}
                {formatUSDShort(marketCap)} market cap.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>Gross MoM</span>
                  <span>{grossMoM.toFixed(1)}×</span>
                </div>
                <Slider
                  value={[grossMoM]}
                  min={MOM_MIN}
                  max={MOM_MAX}
                  step={0.1}
                  onValueChange={([value]) => setGrossMoM(Number(value.toFixed(1)))}
                />
                <p className="text-xs text-slate-500">Scenario slider visible until ownership is provided.</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div
              className="h-40 rounded-2xl border border-slate-200 bg-white/70 p-4"
              aria-label={`Waterfall illustrating invested capital ${formatUSDShort(invested)}, carry ${formatUSDShort(carry)}, and net proceeds ${formatUSDShort(net)}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Returns",
                      invested,
                      carry,
                      netGain: Math.max(net - invested, 0)
                    }
                  ]}
                  layout="vertical"
                >
                  <CartesianGrid horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <RechartsTooltip
                    formatter={(value: number, name) => [formatUSDShort(value), name]}
                    cursor={{ fill: "rgba(14,165,233,0.12)" }}
                  />
                  <Bar dataKey="invested" stackId="a" fill="#0EA5E9" radius={[8, 0, 0, 8]} />
                  <Bar dataKey="carry" stackId="a" fill="#6366F1" />
                  <Bar dataKey="netGain" stackId="a" fill="#10B981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="w-full text-sm text-slate-600">
              <tbody>
                <Row label="Invested after fee" value={formatUSDShort(invested)} />
                <Row label="Gross proceeds" value={formatUSDShort(gross)} />
                <Row label="Gross profit" value={formatUSDShort(grossProfit)} />
                <Row label={`Carry (${formatScenarioPct(carryPct)})`} value={formatUSDShort(carry)} />
                <Row label="Net to investors" value={formatUSDShort(net)} />
                <Row label="Net MoM" value={`${netMoM.toFixed(2)}×`} />
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Projections</CardTitle>
            <CardDescription>Revenue run-rate trajectory sourced from investor placeholder scenarios.</CardDescription>
          </div>
          <div className="flex gap-2 text-xs font-semibold text-slate-500">
            <button
              type="button"
              className={cn("rounded-full px-3 py-1", projectionMode === "abs" ? "bg-sky-600 text-white" : "bg-slate-200")}
              onClick={() => setProjectionMode("abs")}
            >
              $ absolute
            </button>
            <button
              type="button"
              className={cn("rounded-full px-3 py-1", projectionMode === "yoy" ? "bg-sky-600 text-white" : "bg-slate-200")}
              onClick={() => setProjectionMode("yoy")}
            >
              YoY %
            </button>
          </div>
        </CardHeader>
        <div
          className="h-72"
          aria-label={`Projection chart showing ${projectionMode === "abs" ? "revenue" : "growth"} through ${years.at(-1)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="year" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94A3B8"
                tickFormatter={(value) =>
                  projectionMode === "abs" ? formatUSDShort(Number(value)) : formatPct(Number(value), { sign: false })
                }
              />
              <RechartsTooltip content={renderProjectionTooltip(projectionMode)} cursor={{ stroke: "#0EA5E9" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
                isAnimationActive={!prefersReducedMotion}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peer comparables</CardTitle>
          <CardDescription>Contextual peers; click through to available microsites.</CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-3">
          {model.market_comps.map((comp) => (
            <div key={comp.company} className="space-y-3 rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{comp.company}</p>
                {peerRoute[comp.company] ? (
                  <Link
                    href={peerRoute[comp.company] as string}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    View ↗
                  </Link>
                ) : null}
              </div>
              {comp.note ? <p className="text-xs text-slate-500">{comp.note}</p> : null}
              <Badge className="w-fit bg-sky-100 text-sky-700">Scenario</Badge>
            </div>
          ))}
        </div>
      </Card>

      <footer id="sources" className="space-y-2 rounded-2xl border border-slate-200 bg-white/85 p-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Sources</p>
        <ol className="list-decimal space-y-1 pl-5">
          {sourcesEntries.map(([key, url]) => (
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

type KpiPillProps = {
  item: KPIItem;
};

function KpiPill({ item }: KpiPillProps) {
  const { label, value, badge, tooltipSources, hrefs } = item;
  const content = (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-sky-100 bg-white/70 p-4 text-left shadow-[0_20px_60px_-50px_rgba(15,23,42,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
      <span className="inline-flex w-fit items-center rounded-full bg-sky-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-600">
        {badge}
      </span>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-600">{value}</p>
      {hrefs?.length ? (
        <div className="flex flex-wrap gap-2">
          {hrefs.map((href) => (
            <Link key={href.url} href={href.url} target="_blank" rel="noopener" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
              {href.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!tooltipSources.length) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-left">
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent className="space-y-2" align="start">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Sources</p>
        <ul className="space-y-1 text-xs">
          {tooltipSources.map((source) => (
            <li key={source.url}>
              <Link href={source.url} target="_blank" rel="noopener" className="text-sky-600 hover:text-sky-700">
                {source.key.replace(/_/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </li>
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

function strategicsDisplay(strategics: AnthFundModel["funding_context"]["strategics"]): string {
  if (!strategics.length) return "—";
  return strategics
    .map((item) => `${item.name} ${formatUSDShort(item.amount_usd)}`)
    .join(" · ");
}

function parseCurrency(input: string): number | null {
  const digits = input.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const parsed = Number.parseFloat(digits);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatNumberInput(value: number): string {
  if (value == null || Number.isNaN(value)) return "";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function renderProjectionTooltip(mode: "abs" | "yoy") {
  const displayName = mode === "abs" ? "ProjectionTooltipAbs" : "ProjectionTooltipYoy";

  function ProjectionTooltip({ payload }: ProjectionTooltipProps) {
    if (!payload?.length) return null;
    const datum = payload[0].payload;
    const label = mode === "abs" ? "Run rate" : "YoY";
    const value = datum.isNull
      ? "—"
      : mode === "abs"
        ? formatUSDShort(datum.value)
        : formatPct(datum.value, { sign: true });

    return (
      <div className="rounded-xl border border-sky-100 bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        <p className="font-semibold text-slate-700">{datum.year}</p>
        <p>
          {label}: {value}
        </p>
      </div>
    );
  }

  ProjectionTooltip.displayName = displayName;

  return ProjectionTooltip;
}
