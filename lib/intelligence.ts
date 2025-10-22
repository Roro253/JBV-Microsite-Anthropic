import { cache } from "react";
import { z } from "zod";

import rawFeeds from "@/data/intelligence_feeds.json";

const metricSchema = z.object({
  label: z.string(),
  value: z.string(),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "flat"]).optional()
});

const pollSchema = z.object({
  question: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      percent: z.number().min(0).max(100).optional()
    })
  )
});

const mediaSchema = z.object({
  kind: z.enum(["image", "video", "audio", "embed"]),
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional()
});

const cardSchema = z.object({
  id: z.string(),
  type: z.enum(["narrative", "milestone", "data", "market", "future", "poll", "media", "engagement"]),
  title: z.string(),
  timestamp: z.string(),
  summary: z.string(),
  body: z.string().optional(),
  highlight: z.string().optional(),
  metrics: z.array(metricSchema).optional(),
  tags: z.array(z.string()).optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  trending: z.boolean().optional(),
  action: z
    .object({
      label: z.string(),
      href: z.string().optional()
    })
    .optional(),
  media: mediaSchema.optional(),
  poll: pollSchema.optional()
});

const predictionSchema = z.object({
  title: z.string(),
  timeframe: z.string(),
  probability: z.string(),
  narrative: z.string()
});

const engagedSchema = z.object({
  cardId: z.string(),
  message: z.string()
});

const trendIndicatorSchema = z.object({
  label: z.string(),
  value: z.string(),
  helper: z.string().optional()
});

const contrastSchema = z.object({
  title: z.string(),
  current: z.string(),
  previous: z.string(),
  change: z.string(),
  narrative: z.string()
});

const moodIndexSchema = z.object({
  label: z.string(),
  score: z.number(),
  change: z.string().optional()
});

const botSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  systemPrompt: z.string(),
  welcome: z.string(),
  sampleQuestions: z.array(z.string())
});

const feedEntrySchema = z.object({
  headline: z.string(),
  summary: z.string(),
  aiNarrative: z.string().optional(),
  updatedAt: z.string().optional(),
  moodIndex: moodIndexSchema.optional(),
  trendIndicators: z.array(trendIndicatorSchema).optional(),
  topEngaged: z.array(engagedSchema).optional(),
  predictions: z.array(predictionSchema).optional(),
  contrast: contrastSchema.optional(),
  cards: z.array(cardSchema),
  bot: botSchema
});

const intelligenceStoreSchema = z.record(feedEntrySchema);

export type IntelligenceFeedEntry = z.infer<typeof feedEntrySchema>;
export type IntelligenceCard = z.infer<typeof cardSchema>;
export type IntelligencePrediction = z.infer<typeof predictionSchema>;

const loadFeeds = cache(() => {
  const parsed = intelligenceStoreSchema.safeParse(rawFeeds);
  if (!parsed.success) {
    console.warn("[intelligence-feed] validation failed", parsed.error.flatten());
    return {} as Record<string, IntelligenceFeedEntry>;
  }
  return parsed.data;
});

export function getIntelligenceFeed(slug: string): IntelligenceFeedEntry | null {
  const feeds = loadFeeds();
  return feeds[slug] ?? null;
}

export function listIntelligenceFeeds(): Record<string, IntelligenceFeedEntry> {
  return loadFeeds();
}
