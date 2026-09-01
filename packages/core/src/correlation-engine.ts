import type { DataRow } from "./types.js";

export interface CorrelationResult {
  columnA: string;
  columnB: string;
  pearsonR: number;
}

/**
 * Calculates Pearson Correlation coefficient between numeric dataset columns.
 */
export function calculateCorrelation(rows: DataRow[], colA: string, colB: string): CorrelationResult {
  const paired: Array<[number, number]> = [];
  for (const r of rows) {
    const valA = parseFloat(String(r[colA]));
    const valB = parseFloat(String(r[colB]));
    if (!isNaN(valA) && !isNaN(valB)) {
      paired.push([valA, valB]);
    }
  }

  if (paired.length < 2) {
    return { columnA: colA, columnB: colB, pearsonR: 0 };
  }

  const n = paired.length;
  const sumA = paired.reduce((acc, p) => acc + p[0], 0);
  const sumB = paired.reduce((acc, p) => acc + p[1], 0);
  const sumA2 = paired.reduce((acc, p) => acc + p[0] ** 2, 0);
  const sumB2 = paired.reduce((acc, p) => acc + p[1] ** 2, 0);
  const sumAB = paired.reduce((acc, p) => acc + p[0] * p[1], 0);

  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA ** 2) * (n * sumB2 - sumB ** 2));

  const pearsonR = den === 0 ? 0 : num / den;
  return { columnA: colA, columnB: colB, pearsonR };
}
