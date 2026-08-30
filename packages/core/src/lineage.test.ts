import assert from "node:assert/strict"; import test from "node:test"; import { traceUpstream } from "./lineage.js";
test("traces artifact lineage", () => assert.deepEqual(traceUpstream([{ output: "report", inputs: ["profile"], operation: "render", runId: "r" }, { output: "profile", inputs: ["sales.csv"], operation: "profile", runId: "r" }], "report"), ["profile", "sales.csv"]));
