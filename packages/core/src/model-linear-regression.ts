import type { DataRow } from "./types.js";

export interface LinearRegressionModel {
  slope: number;
  intercept: number;
  predict(x: number): number;
}

/**
 * Deterministic Ordinary Least Squares (OLS) Simple Linear Regression Trainer.
 */
export function trainSimpleLinearRegression(rows: DataRow[], xCol: string, yCol: string): LinearRegressionModel {
  const paired: Array<[number, number]> = [];
  for (const r of rows) {
    const x = parseFloat(String(r[xCol]));
    const y = parseFloat(String(r[yCol]));
    if (!isNaN(x) && !isNaN(y)) paired.push([x, y]);
  }

  const n = paired.length || 1;
  const sumX = paired.reduce((acc, p) => acc + p[0], 0);
  const sumY = paired.reduce((acc, p) => acc + p[1], 0);
  const sumXY = paired.reduce((acc, p) => acc + p[0] * p[1], 0);
  const sumX2 = paired.reduce((acc, p) => acc + p[0] ** 2, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const num = sumXY - n * meanX * meanY;
  const den = sumX2 - n * meanX ** 2;

  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  return {
    slope,
    intercept,
    predict: (x: number) => slope * x + intercept,
  };
}
