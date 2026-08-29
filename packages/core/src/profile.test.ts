import assert from "node:assert/strict";
import test from "node:test";
import { parseCsv } from "./parse.js";
import { profileDataset } from "./profile.js";

test("profiles schema, missing values, and duplicate rows", () => {
  const rows = parseCsv("id,amount,active\n1,10,true\n1,10,true\n2,,false\n");
  const profile = profileDataset("sales.csv", "csv", rows);
  assert.equal(profile.rowCount, 3);
  assert.equal(profile.columns.find((column) => column.name === "amount")?.kind, "number");
  assert.equal(profile.columns.find((column) => column.name === "amount")?.missing, 1);
  assert.ok(profile.quality.findings.some((finding) => finding.code === "DUPLICATE_ROWS"));
});
