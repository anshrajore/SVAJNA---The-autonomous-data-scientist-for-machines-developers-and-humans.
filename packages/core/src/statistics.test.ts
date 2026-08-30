import assert from "node:assert/strict";
import test from "node:test";
import { describe, zScores } from "./statistics.js";
test("calculates descriptive statistics", () => { const result = describe([1, 2, 3]); assert.equal(result.mean, 2); assert.equal(result.median, 2); assert.equal(result.standardDeviation.toFixed(3), "0.816"); });
test("does not divide zero-variance series", () => assert.deepEqual(zScores([2, 2]), [0, 0]));
