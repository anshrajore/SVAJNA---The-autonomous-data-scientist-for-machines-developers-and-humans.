import assert from "node:assert/strict"; import test from "node:test"; import { evaluatePolicy } from "./policy.js";
test("gates deployment behind approval", () => assert.deepEqual(evaluatePolicy("model.deploy", 5).approvalRequired, true));
