import assert from "node:assert/strict"; import test from "node:test"; import { requestApproval, resolveApproval } from "./approval.js";
test("makes approvals immutable after resolution", () => { const done = resolveApproval(requestApproval("a", "deploy"), true); assert.throws(() => resolveApproval(done, false)); });
