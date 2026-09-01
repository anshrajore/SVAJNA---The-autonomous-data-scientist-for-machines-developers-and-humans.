import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { trainDecisionStump } from "./model-decision-stump.js";

describe("trainDecisionStump", () => {
  it("splits rows into binary decision branches based on feature threshold", () => {
    const rows = [
      { score: 10, pass: 0 },
      { score: 20, pass: 0 },
      { score: 80, pass: 1 },
      { score: 90, pass: 1 },
    ];
    const stump = trainDecisionStump(rows, "score", "pass");
    assert.equal(stump.left?.label, 0);
    assert.equal(stump.right?.label, 1);
  });
});
