import assert from "node:assert/strict";
import test from "node:test";
import { detectAnomalies } from "./anomaly.js";
test("detects values beyond a configurable z-score", () => assert.equal(detectAnomalies([1, 1, 1, 100], 1).length, 1));
