import { z } from "zod";

export const AnthFundSchema = z.object({
  company_meta: z.object({
    name: z.string(),
    mission: z.string(),
    tagline: z.string(),
    last_updated: z.string()
  }),
  public_kpis: z.object({
    valuation_post_money_usd: z.number().positive(),
    valuation_as_of: z.string(),
    arr_run_rate_usd: z.number().positive(),
    arr_as_of: z.string(),
    notes: z.string().optional()
  }),
  distribution_partners: z.array(
    z.object({
      name: z.string(),
      status: z.string(),
      link: z.string()
    })
  ),
  models: z.array(
    z.object({
      name: z.string(),
      as_of: z.string(),
      source: z.string()
    })
  ),
  safety: z.object({
    headline: z.string(),
    source: z.string()
  }),
  funding_context: z.object({
    series_f_usd: z.number().positive(),
    post_money_usd: z.number().positive(),
    as_of: z.string(),
    strategics: z.array(
      z.object({
        name: z.string(),
        amount_usd: z.number().nonnegative(),
        as_of: z.string().nullable(),
        source: z.string()
      })
    )
  }),
  investment_scenarios: z.object({
    defaults: z.object({
      commitment_usd: z.number().positive(),
      mgmt_fee_pct: z.number().min(0).max(1),
      carry_pct: z.number().min(0).max(1)
    }),
    entry: z.object({
      pre_or_post: z.string(),
      entry_valuation_usd: z.number().nullable(),
      ownership_pct: z.number().nullable(),
      note: z.string().optional()
    })
  }),
  market_cap_calculator: z
    .array(
      z.object({
        year: z.number().int(),
        revenue_run_rate_usd: z.number().positive()
      })
    )
    .min(1),
  market_comps: z.array(
    z.object({
      company: z.string(),
      note: z.string().optional()
    })
  ),
  sources: z.object({}).catchall(z.string())
});

export type AnthFundModel = z.infer<typeof AnthFundSchema>;

export async function getAnthropicFundModel(): Promise<AnthFundModel> {
  const rawModule = await import("@/data/anthropic_fund_model.json");
  const raw = (rawModule as { default?: unknown }).default ?? rawModule;
  const parsed = AnthFundSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(parsed.error);
    throw new Error("Anthropic fund model JSON invalid");
  }
  return parsed.data;
}
