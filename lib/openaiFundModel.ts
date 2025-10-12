import { z } from "zod";

export const FundModelSchema = z.object({
  investment_summary: z.object({
    jbv_interest_usd: z.number().nonnegative(),
    expense_fee_usd: z.number().nonnegative(),
    broker_fee_usd: z.number().nonnegative(),
    purchase_price_usd: z.number().nonnegative(),
    valuation_cap_usd: z.number().positive(),
    implied_cost_basis_usd: z.number().positive()
  }),
  market_cap_calculator: z
    .array(
      z.object({
        year: z.number().int().min(2025).max(2035),
        revenue_run_rate_usd: z.number().nonnegative()
      })
    )
    .min(1),
  waterfall: z.object({
    commitment_default_usd: z.number().positive(),
    jbv_mgmt_fee_pct: z.number().min(0).max(1),
    gross_mom_multiple: z.number().positive(),
    jbv_carry_pct: z.number().min(0).max(1)
  }),
  market_comps: z
    .array(
      z.object({
        company: z.string(),
        yoy_growth_pct: z.number(),
        ev_to_sales: z.number().positive()
      })
    )
    .min(1),
  sources: z.record(z.string(), z.string()),
  last_updated: z.string()
});

export type FundModel = z.infer<typeof FundModelSchema>;

export async function getOpenAIFundModel(): Promise<FundModel> {
  const data = await import("@/data/openai_fund_model.json");
  const parsed = FundModelSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("openai_fund_model.json validation error", parsed.error);
    throw new Error("Fund model data invalid");
  }
  return parsed.data;
}
