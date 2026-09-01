import type { DataRow } from "./types.js";

export interface ModelMetrics {
  mse: number;
  rmse: number;
  mae: number;
  r2: number;
}

/**
 * Calculates regression metrics (MSE, RMSE, MAE, R²) deterministically.
 */
export function calculateRegressionMetrics(actuals: number[], predictions: number[]): ModelMetrics {
  const n = actuals.length;
  if (!n || n !== predictions.length) {
    return { mse: 0, rmse: 0, mae: 0, r2: 0 };
  }

  const errors = actuals.map((act, i) => act - predictions[i]!);
  const mae = errors.reduce((acc, err) => acc + Math.abs(err), 0) / n;
  const mse = errors.reduce((acc, err) => acc + err ** 2, 0) / n;
  const rmse = Math.sqrt(mse);

  const meanActual = actuals.reduce((a, b) => a + b, 0) / n;
  const ssTot = actuals.reduce((acc, act) => acc + (act - meanActual) ** 2, 0);
  const ssRes = errors.reduce((acc, err) => acc + err ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { mse, rmse, mae, r2 };
}
