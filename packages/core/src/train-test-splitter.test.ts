import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { splitTrainTest } from "./train-test-splitter.js";

describe("splitTrainTest", () => {
  it("splits dataset deterministically into train and test sets", () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    const res = splitTrainTest(rows, 0.2);
    assert.equal(res.train.length, 4);
    assert.equal(res.test.length, 1);
  });
});
