export interface DescriptiveStats { count: number; mean: number; median: number; min: number; max: number; variance: number; standardDeviation: number; }
export function describe(values: number[]): DescriptiveStats {
  if (!values.length) throw new Error("Cannot describe an empty series.");
  const sorted = [...values].sort((a, b) => a - b); const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { count: values.length, mean, median, min: sorted[0], max: sorted.at(-1)!, variance, standardDeviation: Math.sqrt(variance) };
}

export function zScores(values: number[]): number[] { const stats = describe(values); return stats.standardDeviation === 0 ? values.map(() => 0) : values.map((value) => (value - stats.mean) / stats.standardDeviation); }
