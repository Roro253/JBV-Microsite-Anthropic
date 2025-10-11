"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState
} from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  getDefaultScenario,
  useUIStore,
  type SimulatorScenario
} from "@/lib/store/ui";
import {
  calculateReturnMetrics,
  buildValueTrajectory,
  type ReturnMetrics
} from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/utils";

export interface ReturnSimulatorHandle {
  toCSV: () => string;
}

interface ReturnSimulatorProps {
  className?: string;
  animate?: boolean;
}

const sliderConfigs = {
  entryValuation: { label: "Entry valuation", min: 120, max: 260, step: 1, suffix: "B" },
  exitValuation: { label: "Exit valuation", min: 200, max: 600, step: 5, suffix: "B" },
  ownershipPct: { label: "Ownership", min: 0.2, max: 2, step: 0.1, suffix: "%" },
  dilutionFollowOn: { label: "Dilution", min: 0, max: 25, step: 1, suffix: "%" },
  years: { label: "Years", min: 3, max: 7, step: 1, suffix: "yrs" }
} as const;

const toScenarioCsv = (
  label: string,
  scenario: SimulatorScenario,
  metrics: ReturnMetrics
) => {
  const rows = [
    ["Label", label],
    ["Entry Valuation (USD B)", scenario.entryValuation.toFixed(2)],
    ["Exit Valuation (USD B)", scenario.exitValuation.toFixed(2)],
    ["Ownership (%)", scenario.ownershipPct.toFixed(2)],
    ["Dilution (%)", scenario.dilutionFollowOn.toFixed(2)],
    ["Years", scenario.years.toString()],
    ["Investment ($)", metrics.investment.toFixed(2)],
    ["Exit Proceeds ($)", metrics.exitProceeds.toFixed(2)],
    ["MOIC", metrics.moic.toFixed(2)],
    ["IRR", (metrics.irr * 100).toFixed(2)]
  ];
  return rows.map((row) => row.join(",")).join("\n");
};

export const ReturnSimulator = forwardRef<ReturnSimulatorHandle, ReturnSimulatorProps>(
  ({ className, animate = true }, ref) => {
    const scenario = useUIStore((state) => state.simulator.current);
    const comparison = useUIStore((state) => state.simulator.comparison);
    const compareEnabled = useUIStore((state) => state.simulator.compareEnabled);
    const updateScenario = useUIStore((state) => state.updateScenario);
    const snapshotComparison = useUIStore((state) => state.snapshotComparison);
    const toggleComparison = useUIStore((state) => state.toggleComparison);
    const resetComparison = useUIStore((state) => state.resetComparison);
    const setScenario = useUIStore((state) => state.setScenario);
    const prefersReducedMotion = useReducedMotion();
    const [copied, setCopied] = useState(false);

    const metrics = useMemo(() => calculateReturnMetrics(scenario), [scenario]);
    const comparisonMetrics = useMemo(
      () => (comparison ? calculateReturnMetrics(comparison) : undefined),
      [comparison]
    );

    const chartData = useMemo(() => {
      const maxYears = Math.max(
        scenario.years,
        comparison && compareEnabled ? comparison.years : 0
      );
      const points = [] as Array<{
        year: number;
        current: number;
        comparison?: number;
      }>;

      const baseCurve = buildValueTrajectory(scenario, metrics);
      const comparisonCurve =
        comparison && compareEnabled
          ? buildValueTrajectory(
              comparison,
              comparisonMetrics ?? calculateReturnMetrics(comparison)
            )
          : undefined;

      for (let index = 0; index <= maxYears; index += 1) {
        const currentPoint = baseCurve[Math.min(index, baseCurve.length - 1)];
        const comparisonPoint = comparisonCurve
          ? comparisonCurve[Math.min(index, comparisonCurve.length - 1)]
          : undefined;

        points.push({
          year: index,
          current: Math.round(currentPoint.value / 1_000_000),
          comparison: comparisonPoint
            ? Math.round(comparisonPoint.value / 1_000_000)
            : undefined
        });
      }

      return points;
    }, [scenario, metrics, comparison, comparisonMetrics, compareEnabled]);

    useImperativeHandle(ref, () => ({
      toCSV: () => {
        const baseCsv = toScenarioCsv("Active", scenario, metrics);
        const comparisonCsv =
          comparison && compareEnabled && comparisonMetrics
            ? `\n\n${toScenarioCsv("Comparison", comparison, comparisonMetrics)}`
            : "";
        return `${baseCsv}${comparisonCsv}`;
      }
    }));

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(
          `MOIC: ${metrics.moic.toFixed(2)}x | IRR: ${(metrics.irr * 100).toFixed(2)}%`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch (error) {
        console.warn("[ReturnSimulator] clipboard unavailable", error);
      }
    };

    const handleReset = () => {
      setScenario(getDefaultScenario());
      resetComparison();
    };

    const sliderItem = <K extends keyof SimulatorScenario>(
      key: K,
      config: (typeof sliderConfigs)[K]
    ) => {
      const value = scenario[key];
      return (
        <div key={key as string} className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="uppercase tracking-[0.2em] text-sky-600">
              {config.label}
            </span>
            <Input
              value={
                typeof value === "number"
                  ? key === "ownershipPct" || key === "dilutionFollowOn"
                    ? value.toFixed(1)
                    : value.toFixed(0)
                  : value
              }
              onChange={(event) => {
                const nextValue = Number.parseFloat(event.target.value);
                if (Number.isFinite(nextValue)) {
                  updateScenario(key, nextValue as SimulatorScenario[K]);
                }
              }}
              className="w-20 text-right"
              inputMode="decimal"
              aria-label={`${config.label} input`}
            />
          </div>
          <Slider
            value={[Number(value)]}
            min={config.min}
            max={config.max}
            step={config.step}
            onValueChange={(vals) => updateScenario(key, vals[0] as SimulatorScenario[K])}
            aria-label={config.label}
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>
              {config.min}
              {config.suffix}
            </span>
            <span>
              {config.max}
              {config.suffix}
            </span>
          </div>
        </div>
      );
    };

    return (
      <div
        className={cn(
          "space-y-6 rounded-3xl border border-sky-200 bg-white/85 p-6 shadow-[0_35px_90px_-60px_rgba(32,118,199,0.4)]",
          className
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">
              Build your Anthropic return profile
            </p>
            <h3 className="text-2xl font-semibold text-slate-800">Return simulator</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy headline"}
            </Button>
            <Button variant="subtle" size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => snapshotComparison()}
            >
              Save scenario
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-sky-200 bg-white/75 px-3 py-1.5 text-xs text-slate-600 shadow-[0_12px_30px_-24px_rgba(32,118,199,0.3)]">
              <Switch
                checked={compareEnabled}
                onCheckedChange={() => toggleComparison()}
                aria-label="Toggle comparison overlay"
              />
              Overlay comparison
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            {(
              Object.keys(sliderConfigs) as Array<keyof typeof sliderConfigs>
            ).map((key) => sliderItem(key, sliderConfigs[key]))}
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-white/90 p-6 shadow-[0_25px_70px_-55px_rgba(32,118,199,0.35)]">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-500/80">
                  MOIC
                </p>
                <motion.p
                  className="text-3xl font-semibold text-slate-800"
                  animate={
                    animate && !prefersReducedMotion
                      ? { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }
                      : undefined
                  }
                  transition={{ duration: 1.6, repeat: animate && !prefersReducedMotion ? Infinity : 0 }}
                >
                  {metrics.moic.toFixed(2)}x
                </motion.p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-indigo-500/80">
                  IRR (annual)
                </p>
                <p className="text-3xl font-semibold text-slate-800">
                  {(metrics.irr * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-500/80">
                  Investment
                </p>
                <p className="text-lg text-slate-700">
                  {formatCurrency(metrics.investment, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-sky-500/80">
                  Exit proceeds
                </p>
                <p className="text-lg text-slate-700">
                  {formatCurrency(metrics.exitProceeds, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <XAxis dataKey="year" stroke="#64748b" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    formatter={(value: number) =>
                      formatCurrency(value * 1_000_000, {
                        maximumFractionDigits: 0
                      })
                    }
                    labelFormatter={(year) => `Year ${year}`}
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: 12,
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#1e293b"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#2563eb"
                    strokeWidth={2.4}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={animate && !prefersReducedMotion}
                  />
                  {comparison && compareEnabled ? (
                    <Line
                      type="monotone"
                      dataKey="comparison"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={animate && !prefersReducedMotion}
                    />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="sr-only" aria-live="polite">
              MOIC {metrics.moic.toFixed(2)}, IRR {(metrics.irr * 100).toFixed(1)} percent.
            </div>
          </div>
        </div>

        {comparison && compareEnabled ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
            <p>
              Comparison scenario: {comparison.entryValuation}B entry → {comparison.exitValuation}
              B exit, {comparison.ownershipPct}% ownership, {comparison.years} years.
            </p>
          </div>
        ) : null}
      </div>
    );
  }
);

ReturnSimulator.displayName = "ReturnSimulator";
