import { describe, expect, it } from "vitest";

import { calculateReturnMetrics } from "@/lib/finance";
import type { SimulatorScenario } from "@/lib/store/ui";

describe("calculateReturnMetrics", () => {
  it("computes MOIC and IRR for baseline scenario", () => {
    const scenario: SimulatorScenario = {
      entryValuation: 200,
      exitValuation: 420,
      ownershipPct: 1,
      dilutionFollowOn: 10,
      years: 5
    };

    const metrics = calculateReturnMetrics(scenario);

    expect(metrics.moic).toBeCloseTo(1.89, 2);
    expect(metrics.irr).toBeGreaterThan(0.12);
    expect(metrics.irr).toBeLessThan(0.14);
  });

  it("handles edge ownership inputs", () => {
    const scenario: SimulatorScenario = {
      entryValuation: 183,
      exitValuation: 300,
      ownershipPct: 0.2,
      dilutionFollowOn: 0,
      years: 3
    };

    const metrics = calculateReturnMetrics(scenario);

    expect(metrics.moic).toBeGreaterThan(1.5);
    expect(metrics.moic).toBeLessThan(1.7);
    expect(metrics.irr).toBeGreaterThan(0.14);
  });

  it("guards against zero investment", () => {
    const scenario: SimulatorScenario = {
      entryValuation: 0,
      exitValuation: 400,
      ownershipPct: 0,
      dilutionFollowOn: 0,
      years: 5
    };

    const metrics = calculateReturnMetrics(scenario);
    expect(metrics.moic).toBe(0);
    expect(metrics.irr).toBe(0);
  });
});
