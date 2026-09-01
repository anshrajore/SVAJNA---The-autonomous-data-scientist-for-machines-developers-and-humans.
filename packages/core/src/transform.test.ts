import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { TransformationEngine } from "./transform.js";

describe("TransformationEngine", () => {
  it("fills missing values and filters rows", () => {
    const engine = new TransformationEngine();
    const rows = [
      { id: 1, val: null },
      { id: 2, val: 10 },
    ];
    const filled = engine.transform(rows, { name: "fill", type: "fill_missing", params: { column: "val", value: 0 } });
    assert.equal(filled[0]!.val, 0);

    const filtered = engine.transform(filled, { name: "filter", type: "filter_rows", params: { column: "id", value: 2 } });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]!.id, 2);
  });
});
