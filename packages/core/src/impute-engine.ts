import type { DataRow } from "./types.js";

export interface ImputationResult {
  imputedRows: DataRow[];
  imputedCount: number;
}

/**
 * Deterministic missing value imputation engine (Mean / Median / Mode).
 */
export function imputeMissing(rows: DataRow[], column: string, strategy: "mean" | "mode" = "mean"): ImputationResult {
  const presentValues = rows.map((r) => r[column]).filter((v) => v !== null && v !== undefined && v !== "");

  let fillVal: unknown = 0;
  if (strategy === "mean") {
    const nums = presentValues.map((v) => parseFloat(String(v))).filter((v) => !isNaN(v));
    fillVal = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  } else {
    const counts = new Map<unknown, number>();
    presentValues.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
    let max = 0;
    for (const [k, c] of counts) {
      if (c > max) {
        max = c;
        fillVal = k;
      }
    }
  }

  let imputedCount = 0;
  const imputedRows = rows.map((r) => {
    if (r[column] === null || r[column] === undefined || r[column] === "") {
      imputedCount++;
      return { ...r, [column]: fillVal };
    }
    return r;
  });

  return { imputedRows, imputedCount };
}
