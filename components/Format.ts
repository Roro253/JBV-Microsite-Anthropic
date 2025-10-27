export function formatUSDShort(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  const units = [
    { limit: 1e12, symbol: "T" },
    { limit: 1e9, symbol: "B" },
    { limit: 1e6, symbol: "M" },
    { limit: 1e3, symbol: "K" }
  ];

  for (const unit of units) {
    if (abs >= unit.limit) {
      return `${value < 0 ? "-" : ""}$${(abs / unit.limit).toFixed(1).replace(/\.0$/, "")}${unit.symbol}`;
    }
  }

  return `${value < 0 ? "-" : ""}$${abs.toLocaleString()}`;
}

export function formatPct(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

export function formatPctFromDecimal(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatPct(value * 100);
}

export function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const closing = new Date(iso).getTime();
  if (Number.isNaN(closing)) return null;
  const diff = closing - Date.now();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export function formatAsOf(dateISO?: string | null): string {
  if (!dateISO) return "";
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
