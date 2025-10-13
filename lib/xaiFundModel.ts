import { z } from "zod";

export const XFundSchema = z.object({
  company_meta: z.object({
    name: z.string(),
    mission: z.string(),
    tagline: z.string(),
    last_updated: z.string()
  }),
  public_signals: z.object({
    models: z.array(
      z.object({
        name: z.string(),
        as_of: z.string(),
        note: z.string().optional()
      })
    ),
    compute: z.object({
      colossus_gpus_live: z.number().positive(),
      claim_built_days: z.number().positive(),
      uptime_pct: z.number().min(0).max(100),
      scale_outlook: z.string(),
      as_of: z.string()
    }),
    fundraising_in_market: z.object({
      amount_usd: z.number().positive(),
      mix: z.object({
        equity_usd: z.number().nonnegative(),
        debt_usd: z.number().nonnegative()
      }),
      notable_participant: z.string().optional(),
      purpose: z.string().optional(),
      status: z.string(),
      as_of: z.string()
    }),
    users_estimate: z.object({
      maus_min: z.number().nonnegative(),
      maus_max: z.number().nonnegative(),
      as_of: z.string(),
      note: z.string().optional()
    }),
    world_model_plan: z.object({
      target: z.string(),
      hires: z.string().optional(),
      as_of: z.string()
    }),
    sources: z.record(z.string(), z.string())
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
  market_cap_calculator: z.array(
    z.object({
      year: z.number().int(),
      revenue_run_rate_usd: z.number().nullable()
    })
  ),
  market_comps: z.array(
    z.object({
      company: z.string(),
      note: z.string().optional()
    })
  )
});

export type XFundModel = z.infer<typeof XFundSchema>;

export async function getXAIFundModel(): Promise<XFundModel> {
  try {
    const raw = await import("@/data/xai_fund_model.json");
    const data = raw.default || raw;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[getXAIFundModel] raw data:', data);
    }
    
    const parsed = XFundSchema.safeParse(data);
    if (!parsed.success) {
      console.error('[getXAIFundModel] validation error:', parsed.error);
      throw new Error("xAI fund model JSON invalid");
    }
    return parsed.data;
  } catch (error) {
    console.error('[getXAIFundModel] load error:', error);
    throw error;
  }
}
