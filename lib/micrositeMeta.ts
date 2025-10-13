import microsites from "@/data/microsites.json";

interface RawMicrosite {
  slug: string;
  name: string;
  symbol?: string | null;
  status: "active" | "closed" | "coming_soon";
  logo?: string | null;
  notes?: string | null;
  valuation_usd?: number | null;
  round?: string | null;
}

export interface MicrositeMeta {
  slug: string;
  name: string;
  symbol: string | null;
  status: "active" | "closed" | "coming_soon";
  logo: string | null;
  notes?: string | null;
  valuationLabel?: string | null;
  round?: string | null;
}

const rawEntries = microsites as RawMicrosite[];

export function getMicrositeMeta(slug: string): MicrositeMeta | undefined {
  const item = rawEntries.find((entry) => entry.slug === slug);
  if (!item) return undefined;
  const valuationLabel =
    typeof item.valuation_usd === "number"
      ? formatBillions(item.valuation_usd)
      : item.round
        ? `${item.round} opportunity`
        : null;

  return {
    slug: item.slug,
    name: item.name,
    symbol: item.symbol ?? null,
    status: item.status,
    logo: item.logo ?? null,
    notes: item.notes,
    valuationLabel,
    round: item.round ?? undefined
  };
}

function formatBillions(value: number) {
  const billions = value / 1_000_000_000;
  const precision = billions >= 10 ? 0 : 1;
  return `$${billions.toFixed(precision)}B valuation`;
}
