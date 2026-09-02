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

/**
 * Normalizes numerical columns using Robust Scaler (median and Interquartile Range).
 */
export function scaleRobust(rows: DataRow[], column: string): { scaledRows: DataRow[]; median: number; iqr: number } {
  const nums = rows.map((r) => parseFloat(String(r[column]))).filter((v) => !isNaN(v)).sort((a, b) => a - b);
  if (!nums.length) return { scaledRows: rows, median: 0, iqr: 1 };
  const median = nums[Math.floor(nums.length / 2)]!;
  const q25 = nums[Math.floor(nums.length * 0.25)]!;
  const q75 = nums[Math.floor(nums.length * 0.75)]!;
  const iqr = (q75 - q25) || 1;

  const scaledRows = rows.map((r) => {
    const val = parseFloat(String(r[column]));
    if (isNaN(val)) return r;
    return { ...r, [column]: (val - median) / iqr };
  });

  return { scaledRows, median, iqr };
}

