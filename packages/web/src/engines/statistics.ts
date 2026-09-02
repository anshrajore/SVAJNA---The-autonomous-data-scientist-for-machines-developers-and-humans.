export interface ColumnStats {
  count: number; missing: number; min: number; max: number;
  mean: number; median: number; mode: number;
  std: number; variance: number; skewness: number; kurtosis: number;
  q25: number; q50: number; q75: number; iqr: number;
  outlierCount: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = lower + 1;
  const weight = index % 1;
  if (upper >= sorted.length) return sorted[lower];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculates comprehensive descriptive statistics for numeric columns,
 * including mean, median, mode, variance, std, skewness, kurtosis, and IQR.
 */
export function computeColumnStats(rawValues: unknown[]): ColumnStats {

  const numbers: number[] = [];
  let missing = 0;

  for (const val of rawValues) {
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      numbers.push(val);
    } else {
      missing++;
    }
  }

  const count = numbers.length;
  if (count === 0) {
    return {
      count: 0, missing, min: 0, max: 0, mean: 0, median: 0, mode: 0,
      std: 0, variance: 0, skewness: 0, kurtosis: 0,
      q25: 0, q50: 0, q75: 0, iqr: 0, outlierCount: 0
    };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[count - 1];

  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += sorted[i];
  }
  const mean = sum / count;

  let sqDiffSum = 0;
  let cubeDiffSum = 0;
  let quadDiffSum = 0;

  for (let i = 0; i < count; i++) {
    const diff = sorted[i] - mean;
    sqDiffSum += diff * diff;
    cubeDiffSum += diff * diff * diff;
    quadDiffSum += diff * diff * diff * diff;
  }

  const variance = sqDiffSum / count;
  const std = Math.sqrt(variance);

  let skewness = 0;
  let kurtosis = 0;

  if (std > 0 && count > 2) {
    const m3 = cubeDiffSum / count;
    const m2 = sqDiffSum / count;
    const g1 = m3 / Math.pow(m2, 1.5);
    skewness = (Math.sqrt(count * (count - 1)) / (count - 2)) * g1;
  }

  if (std > 0 && count > 3) {
    const m4 = quadDiffSum / count;
    const m2 = sqDiffSum / count;
    kurtosis = (m4 / (m2 * m2)) - 3;
  }

  const q25 = percentile(sorted, 0.25);
  const median = percentile(sorted, 0.50);
  const q75 = percentile(sorted, 0.75);
  const iqr = q75 - q25;

  const lowerBound = q25 - 1.5 * iqr;
  const upperBound = q75 + 1.5 * iqr;

  let outlierCount = 0;
  for (let i = 0; i < count; i++) {
    if (sorted[i] < lowerBound || sorted[i] > upperBound) {
      outlierCount++;
    }
  }

  const frequencies = new Map<number, number>();
  let maxFreq = 0;
  let mode = sorted[0];
  for (let i = 0; i < count; i++) {
    const v = sorted[i];
    const freq = (frequencies.get(v) || 0) + 1;
    frequencies.set(v, freq);
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = v;
    }
  }

  return {
    count, missing, min, max, mean, median, mode,
    std, variance, skewness, kurtosis,
    q25, q50: median, q75, iqr, outlierCount
  };
}

export function computeHistogram(values: number[], bucketCount: number = 10): { label: string; count: number; pct: number }[] {
  if (values.length === 0) return [];
  if (bucketCount <= 0) bucketCount = 1;

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }

  if (min === max) {
    return [{ label: `${min}-${max}`, count: values.length, pct: 100 }];
  }

  const span = max - min;
  const bucketSize = span / bucketCount;
  const buckets = Array.from({ length: bucketCount }, () => 0);

  for (let i = 0; i < values.length; i++) {
    let index = Math.floor((values[i] - min) / bucketSize);
    if (index === bucketCount) index--; // Put exact max value in the last bucket
    buckets[index]++;
  }

  const total = values.length;
  return buckets.map((count, i) => {
    const bucketMin = min + i * bucketSize;
    const bucketMax = min + (i + 1) * bucketSize;
    return {
      label: `${bucketMin.toFixed(2)}-${bucketMax.toFixed(2)}`,
      count,
      pct: (count / total) * 100
    };
  });
}
