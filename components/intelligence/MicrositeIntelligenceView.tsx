"use client";
import { motion } from "framer-motion";
import { Activity, Clock3, Flame, Sparkles } from "lucide-react";

import { SourceFootnotes } from "@/components/SourceFootnotes";
import type { IntelligenceFeedEntry } from "@/lib/intelligence";

import { CompanyChatbot } from "./CompanyChatbot";
import { IntelligenceFeed } from "./IntelligenceFeed";

interface MicrositeIntelligenceViewProps {
  companyName: string;
  companySlug: string;
  tagline: string;
  heroDescription: string;
  feed: IntelligenceFeedEntry | null;
  sources?: Array<{ claim: string; url: string }>;
}

export function MicrositeIntelligenceView({
  companyName,
  companySlug,
  tagline,
  heroDescription,
  feed,
  sources
}: MicrositeIntelligenceViewProps) {
  if (!feed) {
    return (
      <motion.section
        className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-600 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.45)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500">
          Live intelligence
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-800">
          {companyName} Intelligence Feed
        </h2>
        <p className="mt-4 text-sm leading-relaxed">
          The intelligence feed is being configured. Check back soon for the live insight stream.
        </p>
      </motion.section>
    );
  }

  const formattedUpdatedAt = formatUpdatedAt(feed.updatedAt);

  const trendingCards = feed.cards.filter((card) => card.trending).slice(0, 3);
  const trendIndicators = feed.trendIndicators ?? [];
  const predictions = (feed.predictions ?? []) as NonNullable<IntelligenceFeedEntry["predictions"]>;
  const topEngaged = (feed.topEngaged ?? []) as NonNullable<IntelligenceFeedEntry["topEngaged"]>;

  return (
    <div className="flex flex-col gap-10">
      <motion.section
        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-indigo-50/70 p-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)]"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">
              <Sparkles className="h-3.5 w-3.5" /> Intelligence pulse
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {feed.headline}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              {heroDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingCards.map((card) => (
                <span
                  key={card.id}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                >
                  <Flame className="h-3.5 w-3.5" /> {card.title}
                </span>
              ))}
            </div>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-inner">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                AI narration
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {feed.aiNarrative ?? tagline}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {feed.moodIndex ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-500">Mood index</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {feed.moodIndex.score}
                  </p>
                  {feed.moodIndex.change ? (
                    <p className="text-xs font-medium text-emerald-600">{feed.moodIndex.change}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Last updated</p>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {formattedUpdatedAt ?? "Realtime"}
                </p>
              </div>
              {topEngaged[0] ? (
                <div className="col-span-2 rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Engagement heat</p>
                  <p className="mt-2 text-sm text-amber-700">{topEngaged[0].message}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.section>

      {trendIndicators.length ? (
        <div className="flex gap-3 overflow-x-auto rounded-3xl border border-slate-200 bg-slate-900/90 p-4 text-xs text-slate-100">
          {trendIndicators.map((indicator) => (
            <div
              key={indicator.label}
              className="min-w-[220px] rounded-2xl border border-white/20 bg-white/5 px-4 py-3"
            >
              <p className="uppercase tracking-[0.3em] text-slate-300">{indicator.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{indicator.value}</p>
              {indicator.helper ? (
                <p className="mt-1 text-[11px] text-slate-300">{indicator.helper}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,_2.6fr)_minmax(320px,_1fr)]">
        <div className="space-y-10">
          <IntelligenceFeed companyName={companyName} feed={feed} showOverview={false} />
        </div>
        <aside className="space-y-6">
          <MoodPanel mood={feed.moodIndex} topEngaged={topEngaged} />
          <PredictionsPanel predictions={predictions} />
          <CompanyChatbot
            companySlug={companySlug}
            config={{
              name: feed.bot.name,
              tagline: feed.bot.tagline,
              welcome: feed.bot.welcome,
              sampleQuestions: feed.bot.sampleQuestions
            }}
          />
          {sources?.length ? <SourceFootnotes sources={sources} /> : null}
        </aside>
      </div>
    </div>
  );
}

function MoodPanel({
  mood,
  topEngaged
}: {
  mood?: IntelligenceFeedEntry["moodIndex"];
  topEngaged: NonNullable<IntelligenceFeedEntry["topEngaged"]>;
}) {
  if (!mood && (!topEngaged || topEngaged.length === 0)) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-[0_18px_52px_-48px_rgba(15,23,42,0.5)]">
      <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        <Activity className="h-4 w-4 text-sky-500" /> Mood & engagement
      </header>
      <div className="mt-4 space-y-4">
        {mood ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-500">Mood index</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold text-slate-900">{mood.score}</span>
              {mood.change ? (
                <span className="text-xs font-medium text-emerald-600">{mood.change}</span>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Derived from investor dwell time, KPI acceleration, and AI sentiment signals.
            </p>
          </div>
        ) : null}
        {topEngaged?.length ? (
          <div className="space-y-3">
            {topEngaged.slice(0, 2).map((item) => (
              <div
                key={item.cardId}
                className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-700"
              >
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
                  <Flame className="h-4 w-4" /> Trending insight
                </p>
                <p className="mt-2 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PredictionsPanel({
  predictions
}: {
  predictions: NonNullable<IntelligenceFeedEntry["predictions"]>;
}) {
  if (!predictions?.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-[0_18px_52px_-48px_rgba(15,23,42,0.5)]">
      <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        <Clock3 className="h-4 w-4 text-sky-500" /> Prediction corner
      </header>
      <div className="mt-4 space-y-4">
        {predictions.map((prediction) => (
          <div key={prediction.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              <span>{prediction.timeframe}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
              <span className="text-slate-500">Prob {prediction.probability}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800">{prediction.title}</p>
            <p className="mt-2 text-sm text-slate-600">{prediction.narrative}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatUpdatedAt(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}
