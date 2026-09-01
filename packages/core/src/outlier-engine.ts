import type { DataRow } from "./types.js";

export interface OutlierCapResult {
  cappedRows: DataRow[];
  cappedCount: number;
}

/**
 * Deterministic IQR-based numerical outlier capping utility.
 */
export function capOutliers(rows: DataRow[], column: string, factor = 1.5): OutlierCapResult {
  const vals = rows
    .map((r) => parseFloat(String(r[column])))
    .filter((v) => !isNaN(v))
    .sort((a, b) => a - b);

  if (!vals.length) return { cappedRows: rows, cappedCount: 0 };

  const q1 = vals[Math.floor(vals.length * 0.25)]!;
  const q3 = vals[Math.floor(vals.length * 0.75)]!;
  const iqr = q3 - q1;

  const lowerBound = q1 - factor * iqr;
  const upperBound = q3 + factor * iqr;

  let cappedCount = 0;
  const cappedRows = rows.map((r) => {
    const val = parseFloat(String(r[column]));
    if (isNaN(val)) return r;
    if (val < lowerBound) {
      cappedCount++;
      return { ...r, [column]: lowerBound };
    }
    if (val > upperBound) {
      cappedCount++;
      return { ...r, [column]: upperBound };
    }
    return r;
  });

  return { cappedRows, cappedCount };
}
