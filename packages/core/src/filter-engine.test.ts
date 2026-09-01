import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { filterDataset } from "./filter-engine.js";

describe("filterDataset", () => {
  it("filters rows by multiple conditions", () => {
    const rows = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 20 },
      { name: "Charlie", age: 25 },
    ];
    const filtered = filterDataset(rows, [
      { field: "age", operator: "gte", value: 25 },
      { field: "name", operator: "contains", value: "A" },
    ]);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]!.name, "Alice");
  });
});
