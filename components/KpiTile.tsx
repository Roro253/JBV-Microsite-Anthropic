import { type ReactNode, memo, useMemo } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface KpiTileProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  asOf?: string;
  icon?: React.ReactNode;
  sparkline?: number[];
  className?: string;
  animate?: boolean;
}

const MotionPath = motion.path;

export const KpiTile = memo(function KpiTile({
  title,
  value,
  subtitle,
  asOf,
  icon,
  sparkline,
  className,
  animate = true
}: KpiTileProps) {
  const points = useMemo(() => {
    if (!sparkline || sparkline.length === 0) return "";
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    return sparkline
      .map((point, index) => {
        const x = (index / (sparkline.length - 1 || 1)) * 100;
        const y = 40 - ((point - min) / range) * 32;
        return `${x},${y}`;
      })
      .join(" ");
  }, [sparkline]);

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between gap-4 rounded-2xl border border-sky-200 bg-white/90 p-6 shadow-[0_30px_80px_-50px_rgba(32,118,199,0.4)] transition duration-300 hover:border-sky-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
            {title}
          </p>
          {subtitle ? (
            <p className="text-sm text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {icon ? <span className="text-sky-500">{icon}</span> : null}
      </div>
      <div className="space-y-3">
        <div className="text-3xl font-semibold text-slate-800">{value}</div>
        {asOf ? (
          <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-100/80 px-3 py-1 text-xs text-sky-700">
            as of {asOf}
          </span>
        ) : null}
      </div>
      {sparkline && sparkline.length > 1 ? (
        <div className="mt-2 h-20 w-full overflow-hidden rounded-xl bg-sky-50">
          <svg
            role="presentation"
            viewBox="0 0 100 40"
            className="h-full w-full stroke-sky-400/80"
          >
            <MotionPath
              d={`M ${points}`}
              fill="none"
              strokeWidth={1.8}
              strokeLinecap="round"
              initial={animate ? { pathLength: 0 } : false}
              animate={animate ? { pathLength: 1 } : undefined}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <span className="sr-only">Additional trend visualization</span>
        </div>
      ) : null}
    </div>
  );
});
