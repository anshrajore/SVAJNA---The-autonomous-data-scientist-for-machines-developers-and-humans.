import type { DataRow } from "./types.js";

export interface TrainTestSplitResult {
  train: DataRow[];
  test: DataRow[];
}

/**
 * Deterministically splits rows into training and testing partitions.
 */
export function splitTrainTest(rows: DataRow[], testRatio = 0.2): TrainTestSplitResult {
  const testSize = Math.floor(rows.length * testRatio);
  const train = rows.slice(0, rows.length - testSize);
  const test = rows.slice(rows.length - testSize);
  return { train, test };
}
