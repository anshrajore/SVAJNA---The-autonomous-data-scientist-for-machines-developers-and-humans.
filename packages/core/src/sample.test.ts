import assert from "node:assert/strict"; import test from "node:test"; import { sampleRows } from "./sample.js";
test("samples evenly and deterministically", () => assert.deepEqual(sampleRows([{ i: 0 }, { i: 1 }, { i: 2 }, { i: 3 }], 2), [{ i: 0 }, { i: 2 }]));
