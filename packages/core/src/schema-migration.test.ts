import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { detectSchemaMigration } from "./schema-migration.js";
import type { DatasetProfile } from "./types.js";

describe("detectSchemaMigration", () => {
  it("detects compatible and breaking schema changes", () => {
    const before: DatasetProfile = {
      source: "v1.csv",
      format: "csv",
      rowCount: 10,
      columns: [
        { name: "id", kind: "number", present: 10, missing: 0, distinct: 10, sample: [1] },
        { name: "email", kind: "string", present: 10, missing: 0, distinct: 10, sample: ["a@b.com"] },
      ],
      quality: { score: 100, findings: [] },
    };

    const afterCompatible: DatasetProfile = {
      ...before,
      source: "v2.csv",
      columns: [
        ...before.columns,
        { name: "age", kind: "number", present: 10, missing: 0, distinct: 5, sample: [25] },
      ],
    };

    const comp = detectSchemaMigration(before, afterCompatible);
    assert.equal(comp.isCompatible, true);
    assert.equal(comp.addedColumns.length, 1);
    assert.equal(comp.addedColumns[0]!.name, "age");

    const afterBreaking: DatasetProfile = {
      ...before,
      source: "v3.csv",
      columns: [
        { name: "id", kind: "string", present: 10, missing: 0, distinct: 10, sample: ["1"] },
      ],
    };

    const breaking = detectSchemaMigration(before, afterBreaking);
    assert.equal(breaking.isCompatible, false);
    assert.equal(breaking.removedColumns.length, 1);
    assert.equal(breaking.removedColumns[0], "email");
    assert.equal(breaking.typeChanges.length, 1);
  });
});
