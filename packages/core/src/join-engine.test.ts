import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { joinDatasets } from "./join-engine.js";

describe("joinDatasets", () => {
  it("performs inner and left joins correctly", () => {
    const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
    const depts = [{ id: 1, dept: "AI" }];

    const inner = joinDatasets(users, depts, { leftKey: "id", rightKey: "id", type: "inner" });
    assert.equal(inner.length, 1);
    assert.equal(inner[0]!.dept, "AI");

    const left = joinDatasets(users, depts, { leftKey: "id", rightKey: "id", type: "left" });
    assert.equal(left.length, 2);
  });
});
