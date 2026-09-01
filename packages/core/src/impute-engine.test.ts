import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { imputeMissing } from "./impute-engine.js";

describe("imputeMissing", () => {
  it("imputes missing numeric values using mean strategy", () => {
    const rows = [{ val: 10 }, { val: null }, { val: 30 }];
    const res = imputeMissing(rows, "val", "mean");
    assert.equal(res.imputedCount, 1);
    assert.equal(res.imputedRows[1]!.val, 20);
  });
});
