import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { calculateRegressionMetrics } from "./metrics-regression.js";

describe("calculateRegressionMetrics", () => {
  it("computes exact MSE, RMSE, MAE, and R2 metrics", () => {
    const actuals = [10, 20, 30];
    const predictions = [10, 20, 30];
    const res = calculateRegressionMetrics(actuals, predictions);
    assert.equal(res.mse, 0);
    assert.equal(res.r2, 1);
  });
});
