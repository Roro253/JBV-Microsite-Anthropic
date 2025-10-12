export function formatUSDShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`.replace(".0", "");
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(1)}B`.replace(".0", "");
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(1)}M`.replace(".0", "");
  return `$${n.toLocaleString()}`;
}

export function formatPct(p: number, opts: { sign?: boolean } = {}): string {
  const value = `${p.toFixed(0)}%`;
  if (opts.sign && p > 0) {
    return `+${value}`;
  }
  return value;
}

export function investedAfterFee(commitment: number, feePct: number): number {
  return commitment * (1 - feePct);
}

export function grossProceeds(invested: number, grossMoM: number): number {
  return invested * grossMoM;
}

export function jbvCarry(grossProfit: number, carryPct: number): number {
  return Math.max(0, grossProfit) * carryPct;
}

export function netToInvestors(
  commitment: number,
  feePct: number,
  grossMoM: number,
  carryPct: number
) {
  const invested = investedAfterFee(commitment, feePct);
  const gross = grossProceeds(invested, grossMoM);
  const grossProfit = gross - invested;
  const carry = jbvCarry(grossProfit, carryPct);
  const net = gross - carry;
  const netMoM = net / commitment;
  return { invested, gross, grossProfit, carry, net, netMoM };
}
