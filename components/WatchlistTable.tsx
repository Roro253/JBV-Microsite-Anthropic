"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Search,
  Star,
  StarOff
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatAsOf, formatPct, formatUSDShort, daysUntil } from "@/components/Format";
import { Sparkline } from "@/components/Sparkline";
import { StatusPill } from "@/components/StatusPill";

export interface WatchlistMicrosite {
  name: string;
  slug: string;
  symbol?: string | null;
  status: Status;
  logo?: string | null;
  link?: string | null;
  round?: string | null;
  valuation_usd?: number | null;
  valuation_as_of?: string | null;
  run_rate_revenue_usd?: number | null;
  run_rate_as_of?: string | null;
  growth_12m_pct?: number | null;
  closing_date?: string | null;
  notes?: string | null;
  revenue_history?: number[];
}

type SortKey = "valuation_usd" | "run_rate_revenue_usd" | "growth_12m_pct" | "status";
type SortDirection = "asc" | "desc";

type Status = "active" | "closed" | "coming_soon";
type AugmentedMicrosite = WatchlistMicrosite & { status: Status; daysLeft?: number | null };

const STORAGE_KEY = "jbv:watchlist:settings";

interface StoredSettings {
  sortKey?: SortKey;
  sortDirection?: SortDirection;
  watched?: string[];
}

const STATUS_FILTERS: Array<{ label: string; value: Status | "all" }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Coming Soon", value: "coming_soon" },
  { label: "Closed", value: "closed" }
];

interface WatchlistTableProps {
  items: WatchlistMicrosite[];
  featuredSlug?: string;
  typeformUrl?: string | null;
}

export function WatchlistTable({ items, featuredSlug, typeformUrl }: WatchlistTableProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("valuation_usd");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [watched, setWatched] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; action?: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: StoredSettings = JSON.parse(raw);
      if (parsed.sortKey) setSortKey(parsed.sortKey);
      if (parsed.sortDirection) setSortDirection(parsed.sortDirection);
      if (parsed.watched) setWatched(parsed.watched);
    } catch (error) {
      console.warn("[watchlist] unable to read settings", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: StoredSettings = {
      sortKey,
      sortDirection,
      watched
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [sortKey, sortDirection, watched]);

  const featured = useMemo(() => {
    if (featuredSlug) return featuredSlug;
    const active = items.find((item) => item.status === "active");
    return active?.slug ?? items[0]?.slug;
  }, [items, featuredSlug]);

  const filtered = useMemo<AugmentedMicrosite[]>(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (!query) return true;
        return (
          item.name.toLowerCase().includes(query) ||
          (item.symbol ?? "").toLowerCase().includes(query)
        );
      })
      .map((item) => {
        const daysLeft = daysUntil(item.closing_date);
        const status =
          item.status === "active" && daysLeft === 0 ? "closed" : (item.status as Status);
        return { ...item, status, daysLeft };
      });
  }, [items, search, statusFilter]);

  const sorted = useMemo<AugmentedMicrosite[]>(() => {
    const copy = [...filtered];
    const direction = sortDirection === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      if (a.slug === featured) return -1;
      if (b.slug === featured) return 1;

      if (sortKey === "status") {
        const priority = { active: 0, coming_soon: 1, closed: 2 };
        return (priority[a.status] - priority[b.status]) * direction;
      }

      const aValue = numericValue(a, sortKey);
      const bValue = numericValue(b, sortKey);

      if (aValue === bValue) {
        return a.name.localeCompare(b.name);
      }
      return (aValue - bValue) * direction;
    });
    return copy;
  }, [filtered, sortDirection, sortKey, featured]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDirection(key === "status" ? "asc" : "desc");
      return key;
    });
  };

  const toggleWatch = (slug: string) => {
    setWatched((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }
      return [...prev, slug];
    });
  };

  const handleRowClick = (item: AugmentedMicrosite) => {
    if (item.status === "active" && item.link) {
      router.push(item.link);
      return;
    }
    setToast({
      message:
        item.status === "coming_soon"
          ? "This window opens soon. Get early access notifications."
          : "This window has closed. Join the waitlist for the next rotation.",
      action: typeformUrl
        ? () => {
            window.open(typeformUrl, "_blank", "noopener");
            setToast(null);
          }
        : undefined
    });
  };

  const handleDownloadCSV = () => {
    const headers = [
      "Symbol",
      "Name",
      "Status",
      "Valuation USD",
      "Valuation As Of",
      "Run-Rate Revenue USD",
      "Run-Rate As Of",
      "12-mo Growth %",
      "Round",
      "Closing Date"
    ];

    const rows = sorted.map((item) => [
      item.symbol ?? "",
      item.name,
      item.status,
      item.valuation_usd ?? "",
      item.valuation_as_of ?? "",
      item.run_rate_revenue_usd ?? "",
      item.run_rate_as_of ?? "",
      item.growth_12m_pct ?? "",
      item.round ?? "",
      item.closing_date ?? ""
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "jbv_watchlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-sky-600" aria-hidden />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-sky-600" aria-hidden />
    );
  };

  const motionProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
      };

  return (
    <div className="space-y-6">
      <header className="sticky top-0 z-30 -mx-4 flex flex-col gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            JBV Capital Syndicate Fund
          </h1>
          <p className="text-sm text-slate-600">
            Watchlist of high-conviction frontier allocations curated by JBV.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Search by symbol or name"
              aria-label="Search microsites"
            />
          </div>
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  statusFilter === filter.value
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>

      <motion.div
        className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] md:block"
        {...motionProps}
      >
        <table className="min-w-full divide-y divide-slate-200 text-sm" role="grid">
          <thead className="bg-sky-50/60 text-slate-700">
            <tr>
              <HeaderCell>Symbol</HeaderCell>
              <HeaderCell sortable onClick={() => toggleSort("valuation_usd")}>
                <span className="inline-flex items-center gap-2">
                  Current Valuation
                  {renderSortIcon("valuation_usd")}
                </span>
              </HeaderCell>
              <HeaderCell sortable onClick={() => toggleSort("run_rate_revenue_usd")}>
                <span className="inline-flex items-center gap-2">
                  Run-Rate Revenue
                  {renderSortIcon("run_rate_revenue_usd")}
                </span>
              </HeaderCell>
              <HeaderCell sortable onClick={() => toggleSort("growth_12m_pct")}>
                <span className="inline-flex items-center gap-2">
                  12-mo Growth
                  {renderSortIcon("growth_12m_pct")}
                </span>
              </HeaderCell>
              <HeaderCell>Round / Last Valuation</HeaderCell>
              <HeaderCell sortable onClick={() => toggleSort("status")}>
                <span className="inline-flex items-center gap-2">
                  Status
                  {renderSortIcon("status")}
                </span>
              </HeaderCell>
              <HeaderCell>Trend</HeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((item) => {
              const watchedFlag = watched.includes(item.slug);
              return (
                <tr
                  key={item.slug}
                  className={cn(
                    "group cursor-pointer bg-white transition hover:bg-sky-50/40 focus-within:bg-sky-50/40",
                    item.slug === featured ? "relative bg-sky-50/30" : undefined
                  )}
                  onClick={() => handleRowClick(item)}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleWatch(item.slug);
                        }}
                        className="rounded-full p-1 text-slate-400 transition hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                        aria-label={watchedFlag ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        {watchedFlag ? <Star className="h-4 w-4 fill-sky-500 text-sky-500" /> : <StarOff className="h-4 w-4" />}
                      </button>
                      <div className="relative h-10 w-10 overflow-hidden rounded-xl ring-1 ring-slate-200">
                        <Image
                          src={item.logo || "/logos/placeholder.svg"}
                          alt={`${item.name} logo`}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {item.symbol ?? "—"}
                            {item.slug === featured ? (
                              <span className="ml-2 inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-600">
                                Featured
                              </span>
                            ) : null}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{item.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="inline-flex flex-col">
                      <span title={formatAsOf(item.valuation_as_of)}>
                        {formatUSDShort(item.valuation_usd)}
                      </span>
                      {item.valuation_as_of ? (
                        <span className="text-xs text-slate-400">as of {item.valuation_as_of}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="inline-flex flex-col">
                      <span title={formatAsOf(item.run_rate_as_of)}>
                        {formatUSDShort(item.run_rate_revenue_usd)}
                      </span>
                      {item.run_rate_as_of ? (
                        <span className="text-xs text-slate-400">as of {item.run_rate_as_of}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <GrowthBadge value={item.growth_12m_pct} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {item.round ? (
                      <span>
                        {item.round}
                        {item.valuation_usd !== undefined && item.valuation_usd !== null
                          ? ` · ${formatUSDShort(item.valuation_usd)}`
                          : ""}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <StatusPill
                      status={item.status}
                      daysLeft={item.status === "active" ? item.daysLeft ?? null : undefined}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Sparkline data={item.revenue_history} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">No companies match your filters yet.</p>
        ) : null}
      </motion.div>

      <div className="space-y-4 md:hidden">
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">No companies match your filters yet.</p>
        ) : null}
        {sorted.map((item, index) => {
          const watchedFlag = watched.includes(item.slug);
          return (
            <div
              key={item.slug}
              className={cn(
                "rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-50px_rgba(15,23,42,0.6)] transition",
                "focus-within:ring-2 focus-within:ring-sky-300",
                item.slug === featured ? "border-sky-200" : undefined
              )}
            >
              <button
                className="flex w-full flex-col gap-3 text-left"
                onClick={() => handleRowClick(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-slate-200">
                      <Image
                        src={item.logo || "/logos/placeholder.svg"}
                        alt={`${item.name} logo`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.symbol ?? "—"}
                        </span>
                        {item.slug === featured ? (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-600">
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">{item.name}</p>
                    </div>
                  </div>
                  <StatusPill
                    status={item.status}
                    daysLeft={item.status === "active" ? item.daysLeft ?? null : undefined}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-500">Current Valuation</p>
                    <p>{formatUSDShort(item.valuation_usd)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Run-Rate Revenue</p>
                    <p>{formatUSDShort(item.run_rate_revenue_usd)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">12-mo Growth</p>
                    <p>
                      <GrowthBadge value={item.growth_12m_pct} compact />
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Round</p>
                    <p>{item.round ?? "—"}</p>
                  </div>
                </div>

                <Sparkline data={item.revenue_history} className="mt-2" />
              </button>
              <div className="mt-3 flex justify-between">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleWatch(item.slug);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {watchedFlag ? (
                    <>
                      <Star className="h-3.5 w-3.5 text-sky-500" />
                      Watched
                    </>
                  ) : (
                    <>
                      <StarOff className="h-3.5 w-3.5" />
                      Watch
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-500">#{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      {toast ? (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="flex max-w-md items-start gap-3 rounded-2xl bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg backdrop-blur">
            <div className="flex-1">{toast.message}</div>
            {toast.action ? (
              <button
                onClick={toast.action}
                className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Notify me
              </button>
            ) : null}
            <button
              onClick={() => setToast(null)}
              className="rounded-full px-2 text-xs text-slate-200 hover:text-white"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface HeaderCellProps {
  children: React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
}

function HeaderCell({ children, sortable, onClick }: HeaderCellProps) {
  if (sortable && onClick) {
    return (
      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1 rounded-full px-1 py-1 text-slate-600 transition hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          {children}
        </button>
      </th>
    );
  }

  return (
    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  );
}

function GrowthBadge({ value, compact }: { value?: number | null; compact?: boolean }) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return compact ? "—" : <span className="text-slate-400">—</span>;
  }
  let classes =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-offset-0";
  if (value >= 100) {
    classes += " bg-emerald-50 text-emerald-700 ring-emerald-200";
  } else if (value >= 0) {
    classes += " bg-sky-50 text-sky-700 ring-sky-200";
  } else {
    classes += " bg-rose-50 text-rose-700 ring-rose-200";
  }

  return (
    <span className={classes}>
      {formatPct(value)}
    </span>
  );
}

function numericValue(item: AugmentedMicrosite, key: SortKey): number {
  if (key === "status") return 0;
  const value = item[key];
  return typeof value === "number" ? value : Number.NEGATIVE_INFINITY;
}
