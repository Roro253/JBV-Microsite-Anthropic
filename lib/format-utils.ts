export function formatGpuFleet(count: number): string {
  return count.toLocaleString();
}

export function formatAsOfDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatBillions(value: number): string {
  return `$${(value / 1_000_000_000).toFixed(1)}B`;
}

export function formatUserRange(min: number, max: number): string {
  const minM = (min / 1_000_000).toFixed(0);
  const maxM = (max / 1_000_000).toFixed(0);
  return `${minM}–${maxM}M`;
}

export function deriveSourceLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname}${pathname}`;
  } catch {
    return url;
  }
}