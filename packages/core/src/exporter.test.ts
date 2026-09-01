import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { exportDataset } from "./exporter.js";

describe("exportDataset", () => {
  it("exports rows to CSV and JSON formats", () => {
    const rows = [{ id: 1, name: "Alice" }];
    const csv = exportDataset(rows, { format: "csv" });
    assert.equal(csv, "id,name\n1,Alice");

    const json = exportDataset(rows, { format: "json" });
    assert.equal(JSON.parse(json)[0].name, "Alice");
  });
});
