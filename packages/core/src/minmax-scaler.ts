import type { DataRow } from "./types.js";

export interface MinMaxResult {
  scaledRows: DataRow[];
  min: number;
  max: number;
}

/**
 * Scales column values to [0, 1] range using Min-Max scaling.
 */
export function scaleMinMax(rows: DataRow[], column: string): MinMaxResult {
  const nums = rows.map((r) => parseFloat(String(r[column]))).filter((v) => !isNaN(v));
  if (!nums.length) return { scaledRows: rows, min: 0, max: 1 };

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;

  const scaledRows = rows.map((r) => {
    const val = parseFloat(String(r[column]));
    if (isNaN(val)) return r;
    return { ...r, [column]: (val - min) / range };
  });

  return { scaledRows, min, max };
}
