"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Flag,
  Heart,
  LineChart,
  Mic,
  Newspaper,
  Share2,
  Sparkles,
  TrendingUp,
  Vote
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IntelligenceCard, IntelligenceFeedEntry } from "@/lib/intelligence";

const CARD_META: Record<
  IntelligenceCard["type"],
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
  }
> = {
  narrative: {
    label: "Narrative",
    icon: Sparkles,
    badgeClass: "bg-violet-100 text-violet-700"
  },
  milestone: {
    label: "Milestone",
    icon: Flag,
    badgeClass: "bg-emerald-100 text-emerald-700"
  },
  data: {
    label: "Data Spark",
    icon: LineChart,
    badgeClass: "bg-sky-100 text-sky-700"
  },
  market: {
    label: "Market Watch",
    icon: Newspaper,
    badgeClass: "bg-amber-100 text-amber-700"
  },
  future: {
    label: "Future Signal",
    icon: TrendingUp,
    badgeClass: "bg-indigo-100 text-indigo-700"
  },
  poll: {
    label: "Investor Pulse",
    icon: Vote,
    badgeClass: "bg-rose-100 text-rose-700"
  },
  media: {
    label: "Voice & Video",
    icon: Mic,
    badgeClass: "bg-fuchsia-100 text-fuchsia-700"
  },
  engagement: {
    label: "Engagement Insight",
    icon: BarChart3,
    badgeClass: "bg-teal-100 text-teal-700"
  }
};

interface IntelligenceFeedProps {
  companyName: string;
  feed: IntelligenceFeedEntry;
  showOverview?: boolean;
}

export function IntelligenceFeed({ companyName, feed, showOverview = true }: IntelligenceFeedProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const formattedUpdatedAt = useMemo(() => {
    if (!feed.updatedAt) return null;
    const date = new Date(feed.updatedAt);
    if (Number.isNaN(date.getTime())) {
      return feed.updatedAt;
    }
    return Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }, [feed.updatedAt]);

  return (
    <div className="flex flex-col gap-8">
      {showOverview ? (
        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/70 p-6 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.4)] sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            <span>Live Intelligence</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden />
            <span className="font-medium tracking-[0.2em] text-slate-400">
              {companyName}
            </span>
            {formattedUpdatedAt ? (
              <>
                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden />
                <span className="tracking-[0.2em] text-slate-400">
                  Updated {formattedUpdatedAt}
                </span>
              </>
            ) : null}
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900">{feed.headline}</h2>
            <p className="max-w-3xl text-base text-slate-600 sm:text-lg">{feed.summary}</p>
          </div>
          {feed.aiNarrative ? (
            <div className="rounded-2xl border border-sky-100 bg-white/70 p-4 text-sm text-slate-600 shadow-sm">
              <p className="font-medium uppercase tracking-[0.25em] text-sky-500">
                Weekly AI narrative
              </p>
              <p className="mt-2 leading-relaxed text-slate-700">{feed.aiNarrative}</p>
            </div>
          ) : null}
          {(feed.moodIndex || feed.trendIndicators?.length) && (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,_220px)_1fr] sm:items-start">
              {feed.moodIndex ? (
                <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-500">{feed.moodIndex.label}</p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-slate-800">{feed.moodIndex.score}</span>
                    {feed.moodIndex.change ? (
                      <span className="text-sm font-medium text-emerald-600">{feed.moodIndex.change}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Derived from investor engagement, KPI delta, and AI sentiment signals.
                  </p>
                </div>
              ) : null}
              {feed.trendIndicators?.length ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {feed.trendIndicators.map((indicator) => (
                    <div
                      key={indicator.label}
                      className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{indicator.label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-800">{indicator.value}</p>
                      {indicator.helper ? (
                        <p className="mt-1 text-xs text-slate-500">{indicator.helper}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          {feed.topEngaged?.length ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-700 shadow-sm">
              <p className="flex items-center gap-2 font-semibold uppercase tracking-[0.3em]">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Engagement signal
              </p>
              <ul className="mt-2 space-y-1 text-amber-700">
                {feed.topEngaged.map((item) => (
                  <li key={item.cardId}>• {item.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        </header>
      ) : null}

      {showOverview && (feed.predictions?.length || feed.contrast) ? (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1.3fr)]">
          {feed.predictions?.length ? (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Prediction Corner
              </h3>
              <div className="mt-4 space-y-4">
                {feed.predictions.map((prediction) => (
                  <div key={prediction.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400">
                      <span>{prediction.timeframe}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
                      <span className="font-medium text-slate-500">Prob {prediction.probability}</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-slate-800">{prediction.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{prediction.narrative}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {feed.contrast ? (
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/70 p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                Contrast Module
              </h3>
              <p className="mt-3 text-base font-semibold text-slate-800">{feed.contrast.title}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{feed.contrast.current}</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Previous</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{feed.contrast.previous}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                <ArrowUpRight className="h-4 w-4" />
                {feed.contrast.change}
              </div>
              <p className="mt-3 text-sm text-slate-600">{feed.contrast.narrative}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        {feed.cards.map((card, index) => {
          const meta = CARD_META[card.type];
          const isExpanded = !!expandedCards[card.id];

          return (
            <motion.article
              key={card.id}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_12px_40px_-32px_rgba(15,23,42,0.45)] transition hover:border-slate-300 hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.5)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                {meta ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 font-semibold tracking-[0.2em]",
                      meta.badgeClass
                    )}
                  >
                    <meta.icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                ) : null}
                <span>{formatTimestamp(card.timestamp)}</span>
                {card.trending ? (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-700">
                    <Sparkles className="h-3 w-3" />
                    Trending
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-3">
                {card.highlight ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
                    {card.highlight}
                  </p>
                ) : null}
                <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-600 sm:text-base">{card.summary}</p>
              </div>

              {card.metrics?.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {card.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {metric.label}
                      </p>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-lg font-semibold text-slate-800">
                          {metric.value}
                        </span>
                        {metric.change ? (
                          <TrendPill change={metric.change} trend={metric.trend} />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {card.media ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <MediaBlock media={card.media} />
                </div>
              ) : null}

              {card.poll ? (
                <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-5">
                  <p className="text-sm font-semibold text-rose-700">{card.poll.question}</p>
                  <div className="mt-3 space-y-2">
                    {card.poll.options.map((option) => (
                      <div key={option.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
                          <span>{option.label}</span>
                          {typeof option.percent === "number" ? <span>{option.percent}%</span> : null}
                        </div>
                        {typeof option.percent === "number" ? (
                          <div className="h-2 rounded-full bg-rose-100">
                            <div
                              className="h-full rounded-full bg-rose-500 transition-all"
                              style={{ width: `${option.percent}%` }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {card.body ? (
                <div className="mt-4">
                  <ExpandableBody
                    body={card.body}
                    expanded={isExpanded}
                    onToggle={() =>
                      setExpandedCards((prev) => ({
                        ...prev,
                        [card.id]: !prev[card.id]
                      }))
                    }
                  />
                </div>
              ) : null}

              {card.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {card.action ? (
                  <Button asChild size="sm" variant="subtle">
                    <Link href={card.action.href ?? "#"} target="_blank" rel="noreferrer">
                      {card.action.label}
                    </Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-sky-600"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  React
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-sky-600"
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-slate-500 hover:text-sky-600"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </motion.article>
          );
        })}
      </section>
    </div>
  );
}

function ExpandableBody({
  body,
  expanded,
  onToggle
}: {
  body: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-3">
      {expanded ? (
        <p className="text-sm leading-relaxed text-slate-600">{body}</p>
      ) : (
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{body}</p>
      )}
      <Button variant="link" size="sm" onClick={onToggle} className="px-0">
        {expanded ? "Show less" : "Expand insight"}
      </Button>
    </div>
  );
}

function MediaBlock({
  media
}: {
  media: NonNullable<IntelligenceCard["media"]>;
}) {
  switch (media.kind) {
    case "image":
      return (
        <div className="relative h-64 w-full">
          <Image src={media.src} alt={media.alt ?? ""} fill className="object-cover" />
          {media.caption ? (
            <p className="absolute bottom-0 left-0 right-0 bg-slate-900/60 px-4 py-2 text-xs text-white">
              {media.caption}
            </p>
          ) : null}
        </div>
      );
    case "video":
      return (
        <div className="relative aspect-video w-full">
          <iframe
            src={media.src}
            title={media.alt ?? "Video insight"}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
          {media.caption ? (
            <p className="bg-slate-900/60 px-4 py-2 text-xs text-white">{media.caption}</p>
          ) : null}
        </div>
      );
    case "audio":
      return (
        <div className="flex flex-col gap-2 p-4">
          <audio controls className="w-full">
            <source src={media.src} />
            Your browser does not support the audio element.
          </audio>
          {media.caption ? (
            <p className="text-xs text-slate-500">{media.caption}</p>
          ) : null}
        </div>
      );
    case "embed":
      return (
        <div className="relative aspect-video w-full">
          <iframe src={media.src} title={media.alt ?? "Embedded insight"} className="h-full w-full" />
        </div>
      );
    default:
      return null;
  }
}

function TrendPill({
  change,
  trend
}: {
  change: string;
  trend?: "up" | "down" | "flat";
}) {
  const Icon = trend === "down" ? ArrowDownRight : ArrowUpRight;
  const colorClasses =
    trend === "down"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : trend === "flat"
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        colorClasses
      )}
    >
      {trend === "flat" ? null : <Icon className="h-3.5 w-3.5" />}
      {change}
    </span>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
