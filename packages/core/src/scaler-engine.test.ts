import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { scaleStandard } from "./scaler-engine.js";

describe("scaleStandard", () => {
  it("normalizes column values to z-scores", () => {
    const rows = [{ val: 10 }, { val: 20 }, { val: 30 }];
    const res = scaleStandard(rows, "val");
    assert.equal(res.mean, 20);
    assert.equal(res.scaledRows[1]!.val, 0);
  });
});
