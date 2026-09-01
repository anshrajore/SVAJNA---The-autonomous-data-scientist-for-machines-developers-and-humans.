import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { detectDataDrift } from "./data-drift.js";

describe("detectDataDrift", () => {
  it("flags dataset statistical mean drift", () => {
    const base = [{ val: 10 }, { val: 12 }];
    const curr = [{ val: 50 }, { val: 60 }];
    const report = detectDataDrift(base, curr, "val", 0.2);
    assert.equal(report.driftDetected, true);
    assert.ok(report.differenceRatio > 0.2);
  });
});
