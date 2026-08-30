import assert from "node:assert/strict"; import test from "node:test"; import { AnalyticalMemory } from "./memory.js";
test("connects persistent analytical context", () => { const m = new AnalyticalMemory(); m.add({ id: "data", type: "dataset", label: "sales" }); m.add({ id: "run", type: "run", label: "today" }); m.link("data", "run", "analyzed_by"); assert.equal(m.related("data").length, 1); });
