import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { calculateConfusionMatrix } from "./metrics-classification.js";

describe("calculateConfusionMatrix", () => {
  it("computes precision, recall, accuracy, and f1 score", () => {
    const actuals = [1, 1, 0, 0];
    const predictions = [1, 0, 0, 0];
    const res = calculateConfusionMatrix(actuals, predictions);
    assert.equal(res.tp, 1);
    assert.equal(res.accuracy, 0.75);
    assert.equal(res.precision, 1);
  });
});
