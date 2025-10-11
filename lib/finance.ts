import type { SimulatorScenario } from "@/lib/store/ui";

export type ReturnMetrics = {
  moic: number;
  irr: number;
  investment: number;
  exitProceeds: number;
};

export const calculateReturnMetrics = (scenario: SimulatorScenario): ReturnMetrics => {
  const entry = scenario.entryValuation * 1_000_000_000;
  const exit = scenario.exitValuation * 1_000_000_000;
  const ownership = scenario.ownershipPct / 100;
  const dilution = Math.max(0, Math.min(scenario.dilutionFollowOn, 100)) / 100;

  const investment = entry * ownership;
  const exitProceeds = exit * ownership * (1 - dilution);

  if (investment <= 0 || scenario.years <= 0) {
    return {
      moic: 0,
      irr: 0,
      investment,
      exitProceeds
    };
  }

  const moic = exitProceeds / investment;
  const irr = Math.max(Math.pow(Math.max(exitProceeds, 1) / investment, 1 / scenario.years) - 1, 0);

  return {
    moic,
    irr,
    investment,
    exitProceeds
  };
};

export const buildValueTrajectory = (
  scenario: SimulatorScenario,
  metrics: ReturnMetrics
) => {
  const points: { year: number; value: number }[] = [];
  for (let year = 0; year <= scenario.years; year += 1) {
    const share = Math.min(year / scenario.years, 1);
    const value =
      metrics.investment + (metrics.exitProceeds - metrics.investment) * share;
    points.push({ year, value });
  }
  return points;
};
