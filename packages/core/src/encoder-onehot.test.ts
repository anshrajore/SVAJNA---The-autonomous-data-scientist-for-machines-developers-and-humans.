import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { oneHotEncode } from "./encoder-onehot.js";

describe("oneHotEncode", () => {
  it("encodes categorical values into binary columns", () => {
    const rows = [{ dept: "AI" }, { dept: "Eng" }];
    const res = oneHotEncode(rows, "dept");
    assert.equal(res.newColumns.length, 2);
    assert.equal(res.encodedRows[0]!.dept_ai, 1);
    assert.equal(res.encodedRows[0]!.dept_eng, 0);
  });
});
