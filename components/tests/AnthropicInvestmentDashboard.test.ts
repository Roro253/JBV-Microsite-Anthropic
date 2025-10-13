import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

import AnthropicInvestmentDashboard from "@/components/AnthropicInvestmentDashboard";
import type { AnthFundModel } from "@/lib/anthropicFundModel";
import anthropicFundModel from "@/data/anthropic_fund_model.json";
import { grossProceeds, investedAfterFee, jbvCarry } from "@/lib/format";

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
  type PassthroughProps = { children?: React.ReactNode };
  const Passthrough = ({ children }: PassthroughProps) =>
    React.createElement("div", null, children);
  return {
    TooltipProvider: Passthrough,
    Tooltip: Passthrough,
    TooltipTrigger: Passthrough,
    TooltipContent: Passthrough
  };
});

vi.mock("recharts", () => {
  type PassthroughProps = { children?: React.ReactNode };
  const Passthrough = ({ children }: PassthroughProps) =>
    React.createElement("div", null, children);
  return {
    ResponsiveContainer: Passthrough,
    BarChart: Passthrough,
    Bar: Passthrough,
    CartesianGrid: () => null,
    Cell: () => null,
    LineChart: Passthrough,
    Line: () => null,
    Tooltip: Passthrough,
    XAxis: () => null,
    YAxis: () => null
  };
});

vi.mock("@/lib/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => true
}));

const model = anthropicFundModel as AnthFundModel;

beforeEach(() => {
  localStorage.clear();
});

describe("Anthropic waterfall math", () => {
  test("fee math: invested after 5% is 950k", () => {
    expect(investedAfterFee(1_000_000, 0.05)).toBe(950_000);
  });

  test("ownership path beats invested capital", () => {
    const ownership = 0.1;
    const marketCap = 500_000_000_000;
    const invested = investedAfterFee(1_000_000, 0.05);
    const gross = ownership * marketCap;
    expect(gross).toBeGreaterThan(invested);
  });

  test("gross MoM path nets positive after carry", () => {
    const commitment = 1_000_000;
    const invested = investedAfterFee(commitment, 0.05);
    const gross = grossProceeds(invested, 3.0);
    const profit = gross - invested;
    const carry = jbvCarry(profit, 0.1);
    const net = gross - carry;
    const netMoM = net / commitment;
    expect(netMoM).toBeGreaterThan(1);
  });
});

describe("Anthropic dashboard UI", () => {
  test("renders KPI row with valuation and ARR", () => {
    render(React.createElement(AnthropicInvestmentDashboard, { fundModel: model }));
    expect(screen.getAllByText("$183B").length).toBeGreaterThan(0);
    expect(screen.getByText((content) => content.includes("$5B"))).toBeInTheDocument();
  });
});
