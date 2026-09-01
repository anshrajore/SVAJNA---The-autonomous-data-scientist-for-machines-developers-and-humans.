import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { calculateCorrelation } from "./correlation-engine.js";

describe("calculateCorrelation", () => {
  it("computes exact linear correlation", () => {
    const rows = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 },
    ];
    const res = calculateCorrelation(rows, "x", "y");
    assert.equal(Math.round(res.pearsonR), 1);
  });
});
