import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import React, { type ReactNode } from "react";
import { render } from "@testing-library/react";

import XAIInvestmentDashboard from "@/components/XAIInvestmentDashboard";
import type { XFundModel } from "@/lib/xaiFundModel";
import { investedAfterFee, netToInvestors } from "@/lib/format";

vi.stubGlobal("React", React);
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

vi.mock("@/components/ui/tooltip", () => {
  const passthrough = ({ children }: { children?: ReactNode }) => React.createElement("div", null, children);
  return {
    TooltipProvider: passthrough,
    Tooltip: passthrough,
    TooltipTrigger: passthrough,
    TooltipContent: passthrough
  };
});

vi.mock("recharts", () => {
  const passthrough = ({ children }: { children?: ReactNode }) => React.createElement("div", null, children);
  return {
    ResponsiveContainer: passthrough,
    BarChart: passthrough,
    Bar: passthrough,
    CartesianGrid: () => null,
    Cell: () => null,
    LineChart: passthrough,
    Line: () => null,
    Tooltip: passthrough,
    XAxis: () => null,
    YAxis: () => null
  };
});

vi.mock("@/lib/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => true
}));

const baseModel: XFundModel = {
  company_meta: {
    name: "xAI",
    mission: "",
    tagline: "",
    last_updated: "2025-10-12"
  },
  public_signals: {
    models: [],
    compute: {
      colossus_gpus_live: 150000,
      claim_built_days: 122,
      uptime_pct: 99,
      scale_outlook: "Expected to double in months",
      as_of: "2025-06-01"
    },
    fundraising_in_market: {
      amount_usd: 20000000000,
      mix: { equity_usd: 7500000000, debt_usd: 12500000000 },
      notable_participant: "Nvidia up to $2B",
      purpose: "Colossus 2 GPU procurement",
      status: "reported",
      as_of: "2025-10-07"
    },
    users_estimate: {
      maus_min: 30000000,
      maus_max: 39000000,
      as_of: "2025-09-30",
      note: "estimate"
    },
    world_model_plan: {
      target: "AI-generated video game by end-2026",
      hires: "Nvidia",
      as_of: "2025-10-12"
    },
    sources: {
      colossus: "https://x.ai/colossus"
    }
  },
  investment_scenarios: {
    defaults: {
      commitment_usd: 1_000_000,
      mgmt_fee_pct: 0.05,
      carry_pct: 0.1
    },
    entry: {
      pre_or_post: "scenario",
      entry_valuation_usd: null,
      ownership_pct: 10,
      note: ""
    }
  },
  market_cap_calculator: [
    { year: 2026, revenue_run_rate_usd: null },
    { year: 2027, revenue_run_rate_usd: null }
  ],
  market_comps: []
};

beforeEach(() => {
  localStorage.clear();
});

describe("xAI investment helpers", () => {
  test("invested after 5% fee", () => {
    expect(investedAfterFee(1_000_000, 0.05)).toBe(950_000);
  });

  test("ownership-based proceeds exceed invested capital", () => {
    const ownershipPct = 0.1;
    const marketCap = 200_000_000_000;
    const invested = investedAfterFee(1_000_000, 0.05);
    const gross = ownershipPct * marketCap;
    expect(gross).toBeGreaterThan(invested);
  });

  test("gross MoM fallback yields net MoM > 1", () => {
    const result = netToInvestors(1_000_000, 0.05, 3.0, 0.1);
    expect(result.netMoM).toBeGreaterThan(1);
  });
});

describe("xAI investment dashboard", () => {
  test("renders guided empty state when projections missing", () => {
    const { container, getByText } = render(
      React.createElement(XAIInvestmentDashboard, { fundModel: baseModel })
    );
    expect(getByText(/add revenue projections/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
