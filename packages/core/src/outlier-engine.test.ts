import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { capOutliers } from "./outlier-engine.js";

describe("capOutliers", () => {
  it("caps extreme numerical values to IQR boundaries", () => {
    const rows = [{ val: 10 }, { val: 12 }, { val: 14 }, { val: 15 }, { val: 100 }];
    const res = capOutliers(rows, "val");
    assert.equal(res.cappedCount, 1);
    assert.ok(res.cappedRows[4]!.val < 100);
  });
});
