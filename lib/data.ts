import { cache } from "react";
import { z } from "zod";
import anthropicRaw from "@/data/anthropic.json";

const kpiMetricSchema = z.object({
  value: z.number(),
  as_of: z.string(),
  unit: z.string()
});

const anthropicSchema = z.object({
  company: z.object({
    name: z.string(),
    founded: z.string().optional(),
    structure: z.string(),
    mission: z.string(),
    tagline: z.string()
  }),
  leadership: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string()
      })
    )
    .min(1),
  product: z.object({
    platform: z.string(),
    highlights: z.array(z.string())
  }),
  kpis: z.object({
    run_rate_revenue: kpiMetricSchema,
    valuation: kpiMetricSchema,
    recent_round: z.object({
      round: z.string(),
      amount: z.number(),
      date: z.string(),
      lead: z.string()
    }),
    cloud_backers: z.array(z.string()),
    enterprise_adoption_notes: z.string()
  }),
  differentiators: z.array(z.string()),
  use_cases: z.array(z.string()),
  modes: z.object({
    explorer: z.object({ story: z.string() }),
    investor: z.object({ thesis: z.string() })
  }),
  spv_terms: z.object({
    min_check_usd: z.number(),
    fees: z.string(),
    closing_target: z.string(),
    docs_note: z.string()
  }),
  links: z.object({
    reserve_interest: z.string(),
    book_diligence: z.string()
  }),
  sources: z
    .array(
      z.object({
        claim: z.string(),
        url: z.string().url()
      })
    )
    .min(1),
  last_updated: z.string()
});

export type AnthropicData = z.infer<typeof anthropicSchema>;

let cachedData: AnthropicData | null = null;

const resolveLink = (value: string) => {
  if (value.startsWith("ENV:")) {
    const envKey = value.split("ENV:").at(1)?.trim();
    if (envKey) {
      const resolved = process.env[envKey];
      if (!resolved) {
        console.warn(
          `[anthropic-data] Missing environment variable ${envKey}. Did you update .env.local?`
        );
      }
      return resolved ?? "#";
    }
  }
  return value;
};

const fallbackData: AnthropicData = {
  company: {
    name: "Anthropic",
    founded: "2021",
    structure: "Public Benefit Corporation (PBC)",
    mission: "Build reliable, interpretable, and steerable AI systems that benefit humanity.",
    tagline: "Enterprise-grade, safety-first frontier AI."
  },
  leadership: [
    {
      name: "TBD",
      role: "Leadership placeholder",
      bio: "Content temporarily unavailable."
    }
  ],
  product: {
    platform: "Claude",
    highlights: []
  },
  kpis: {
    run_rate_revenue: { value: 0, as_of: "", unit: "USD" },
    valuation: { value: 0, as_of: "", unit: "USD" },
    recent_round: { round: "", amount: 0, date: "", lead: "" },
    cloud_backers: [],
    enterprise_adoption_notes: ""
  },
  differentiators: [],
  use_cases: [],
  modes: {
    explorer: { story: "" },
    investor: { thesis: "" }
  },
  spv_terms: {
    min_check_usd: 0,
    fees: "",
    closing_target: "",
    docs_note: ""
  },
  links: {
    reserve_interest: "#",
    book_diligence: "#"
  },
  sources: [],
  last_updated: new Date().toISOString().split("T")[0]
};

const hydrateData = () => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const parsed = anthropicSchema.safeParse(anthropicRaw);
    if (!parsed.success) {
      console.warn("[anthropic-data] Validation failed", parsed.error.flatten());
      cachedData = fallbackData;
      return cachedData;
    }

    const data = parsed.data;
    cachedData = {
      ...data,
      links: {
        reserve_interest: resolveLink(data.links.reserve_interest),
        book_diligence: resolveLink(data.links.book_diligence)
      }
    };
    return cachedData;
  } catch (error) {
    console.warn("[anthropic-data] Failed to load data", error);
    cachedData = fallbackData;
    return cachedData;
  }
};

export const getAnthropicData = cache(hydrateData);
