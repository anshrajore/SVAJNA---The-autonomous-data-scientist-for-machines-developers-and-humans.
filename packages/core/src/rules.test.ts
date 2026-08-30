import assert from "node:assert/strict"; import test from "node:test"; import { nonEmptyRule, runRules } from "./rules.js";
test("runs declarative quality rules", () => assert.equal(runRules([{ id: 1 }, { id: null }], [nonEmptyRule("id")])[0].passed, false));
