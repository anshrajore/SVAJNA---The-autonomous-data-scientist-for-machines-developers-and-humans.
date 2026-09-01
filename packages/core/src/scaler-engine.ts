import type { DataRow } from "./types.js";

export interface StandardScalerResult {
  scaledRows: DataRow[];
  mean: number;
  stdDev: number;
}

/**
 * Normalizes numerical columns using z-score Standardization (mean=0, std=1).
 */
export function scaleStandard(rows: DataRow[], column: string): StandardScalerResult {
  const nums = rows.map((r) => parseFloat(String(r[column]))).filter((v) => !isNaN(v));
  if (!nums.length) return { scaledRows: rows, mean: 0, stdDev: 1 };

  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (nums.length || 1);
  const stdDev = Math.sqrt(variance) || 1;

  const scaledRows = rows.map((r) => {
    const val = parseFloat(String(r[column]));
    if (isNaN(val)) return r;
    return { ...r, [column]: (val - mean) / stdDev };
  });

  return { scaledRows, mean, stdDev };
}
