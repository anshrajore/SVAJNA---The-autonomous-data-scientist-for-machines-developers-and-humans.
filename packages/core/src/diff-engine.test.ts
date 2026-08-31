import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { diffRows } from "./diff-engine.js";

describe("diffRows", () => {
  it("detects added, removed, modified, and unchanged rows", () => {
    const before = [
      { id: "1", name: "Alice", score: 100 },
      { id: "2", name: "Bob", score: 80 },
    ];
    const after = [
      { id: "1", name: "Alice", score: 100 },
      { id: "2", name: "Bob", score: 95 },
      { id: "3", name: "Charlie", score: 70 },
    ];

    const res = diffRows(before, after, "id");
    assert.equal(res.unchangedCount, 1);
    assert.equal(res.modified.length, 1);
    assert.equal(res.modified[0]!.after.score, 95);
    assert.equal(res.added.length, 1);
    assert.equal(res.added[0]!.name, "Charlie");
    assert.equal(res.removed.length, 0);
  });
});
