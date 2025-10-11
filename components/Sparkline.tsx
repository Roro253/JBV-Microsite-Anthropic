"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface SparklineProps {
  data?: number[] | null;
  className?: string;
}

export const Sparkline = memo(function Sparkline({ data, className }: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className={className} aria-hidden>
        —
      </div>
    );
  }

  const chartData = data.map((value, index) => ({ index, value }));
  const first = data[0];
  const last = data[data.length - 1];

  const label = `Revenue trend ${last >= first ? "increasing" : "decreasing"} from ${formatNumber(
    first
  )} to ${formatNumber(last)}`;

  return (
    <div className={className} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={chartData} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <XAxis dataKey="index" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number) => formatNumber(value)}
            labelFormatter={() => ""}
            cursor={{ stroke: "rgba(14,165,233,0.35)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`.replace(".0", "");
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`.replace(".0", "");
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`.replace(".0", "");
  return `$${value.toLocaleString()}`;
}
