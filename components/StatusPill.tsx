"use client";

import { cn } from "@/lib/utils";

type Status = "active" | "closed" | "coming_soon";

interface StatusPillProps {
  status: Status;
  daysLeft?: number | null;
}

const base =
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition";

const styles: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  coming_soon: "bg-sky-50 text-sky-700 ring-sky-200",
  closed: "bg-slate-200 text-slate-600 ring-slate-300"
};

const labels: Record<Status, string> = {
  active: "Active",
  coming_soon: "Coming Soon",
  closed: "Closed"
};

export function StatusPill({ status, daysLeft }: StatusPillProps) {
  const showCountdown = status === "active" && daysLeft !== null && daysLeft !== undefined;
  return (
    <span className={cn(base, styles[status])}>
      {labels[status]}
      {showCountdown ? (
        <span className="rounded-full bg-white/70 px-2 text-[10px] font-semibold text-emerald-600">
          {daysLeft === 0 ? "Closing now" : `${daysLeft}d left`}
        </span>
      ) : null}
    </span>
  );
}
