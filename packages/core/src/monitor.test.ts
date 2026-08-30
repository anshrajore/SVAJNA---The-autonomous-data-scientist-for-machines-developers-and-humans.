import assert from "node:assert/strict"; import test from "node:test"; import { compareMetric } from "./monitor.js";
test("flags meaningful metric movement", () => assert.equal(compareMetric({ metric: "revenue", value: 100, capturedAt: "" }, { metric: "revenue", value: 120, capturedAt: "" }).changed, true));
