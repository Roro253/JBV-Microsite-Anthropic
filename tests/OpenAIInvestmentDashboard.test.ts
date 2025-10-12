import { describe, expect, test } from "vitest";

import { grossProceeds, investedAfterFee, netToInvestors } from "@/lib/format";

describe("OpenAI fund model formulas", () => {
  test("invested after 5% fee on $1,000,000", () => {
    expect(investedAfterFee(1_000_000, 0.05)).toBe(950_000);
  });

  test("gross proceeds with 3.77x", () => {
    expect(grossProceeds(950_000, 3.77)).toBeCloseTo(3_581_500, 0);
  });

  test("net to investors with 10% carry", () => {
    const result = netToInvestors(1_000_000, 0.05, 3.77, 0.1);
    expect(result.invested).toBe(950_000);
    expect(result.gross).toBeCloseTo(3_581_500, 0);
    expect(result.carry).toBeGreaterThan(0);
    expect(result.net).toBeGreaterThan(result.invested);
    expect(result.netMoM).toBeGreaterThan(1);
  });
});
