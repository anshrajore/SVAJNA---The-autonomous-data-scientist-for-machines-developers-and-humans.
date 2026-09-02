export function shuffleArray<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let currentSeed = seed;
  const lcg = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (currentSeed >>> 0) / 4294967296;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(lcg() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function trainTestSplit<T>(data: T[], testRatio: number = 0.2, seed: number = 42): { train: T[]; test: T[] } {
  const shuffled = shuffleArray(data, seed);
  const testCount = Math.floor(shuffled.length * testRatio);
  return {
    test: shuffled.slice(0, testCount),
    train: shuffled.slice(testCount)
  };
}

export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function normalizeColumn(values: number[]): { normalized: number[]; min: number; max: number } {
  if (values.length === 0) return { normalized: [], min: 0, max: 0 };
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < min) min = values[i];
    if (values[i] > max) max = values[i];
  }
  const range = max - min;
  const normalized = values.map(v => range === 0 ? 0 : (v - min) / range);
  return { normalized, min, max };
}

export function standardizeColumn(values: number[]): { standardized: number[]; mean: number; std: number } {
  if (values.length === 0) return { standardized: [], mean: 0, std: 0 };
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  const mean = sum / values.length;
  
  let sqSum = 0;
  for (let i = 0; i < values.length; i++) {
    sqSum += (values[i] - mean) ** 2;
  }
  const std = Math.sqrt(sqSum / values.length);
  
  const standardized = values.map(v => std === 0 ? 0 : (v - mean) / std);
  return { standardized, mean, std };
}
