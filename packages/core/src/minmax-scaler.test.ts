import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { scaleMinMax } from "./minmax-scaler.js";

describe("scaleMinMax", () => {
  it("scales numeric columns into [0, 1] range", () => {
    const rows = [{ val: 10 }, { val: 20 }, { val: 30 }];
    const res = scaleMinMax(rows, "val");
    assert.equal(res.scaledRows[0]!.val, 0);
    assert.equal(res.scaledRows[2]!.val, 1);
  });
});
