import type { DataRow } from "./types.js";

export interface DataDriftReport {
  column: string;
  driftDetected: boolean;
  baselineMean: number;
  currentMean: number;
  differenceRatio: number;
}

/**
 * Detects Statistical Data Drift between baseline and production datasets.
 */
export function detectDataDrift(baselineRows: DataRow[], currentRows: DataRow[], column: string, threshold = 0.2): DataDriftReport {
  const baseVals = baselineRows.map((r) => parseFloat(String(r[column]))).filter((v) => !isNaN(v));
  const currVals = currentRows.map((r) => parseFloat(String(r[column]))).filter((v) => !isNaN(v));

  if (!baseVals.length || !currVals.length) {
    return { column, driftDetected: false, baselineMean: 0, currentMean: 0, differenceRatio: 0 };
  }

  const baselineMean = baseVals.reduce((a, b) => a + b, 0) / baseVals.length;
  const currentMean = currVals.reduce((a, b) => a + b, 0) / currVals.length;

  const diff = Math.abs(currentMean - baselineMean);
  const differenceRatio = baselineMean === 0 ? diff : diff / Math.abs(baselineMean);
  const driftDetected = differenceRatio >= threshold;

  return { column, driftDetected, baselineMean, currentMean, differenceRatio };
}
