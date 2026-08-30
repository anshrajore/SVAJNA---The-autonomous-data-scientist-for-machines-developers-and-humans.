import assert from "node:assert/strict"; import test from "node:test"; import { validateClaim } from "./validation.js";
test("requires confident deterministic evidence", () => assert.equal(validateClaim("Revenue rose", [{ id: "a", statement: "x", source: "run", confidence: .7 }]).status, "insufficient"));
