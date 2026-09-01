import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { aggregateDataset } from "./aggregation-engine.js";

describe("aggregateDataset", () => {
  it("aggregates sum and mean correctly", () => {
    const rows = [
      { dept: "AI", salary: 100 },
      { dept: "AI", salary: 200 },
      { dept: "Eng", salary: 150 },
    ];
    const sumRes = aggregateDataset(rows, { groupByColumn: "dept", targetColumn: "salary", operation: "sum" });
    assert.equal(sumRes["AI"], 300);
    assert.equal(sumRes["Eng"], 150);

    const meanRes = aggregateDataset(rows, { groupByColumn: "dept", targetColumn: "salary", operation: "mean" });
    assert.equal(meanRes["AI"], 150);
  });
});
