import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { standardizeDataset } from "./schema-standardizer.js";

describe("standardizeDataset", () => {
  it("normalizes column names to lowercase snake_case", () => {
    const rows = [{ "User ID": 1, "First Name": "Alice" }];
    const res = standardizeDataset(rows);
    assert.deepEqual(res.columnNames, ["user_id", "first_name"]);
    assert.equal(res.rows[0]!.user_id, 1);
  });
});
