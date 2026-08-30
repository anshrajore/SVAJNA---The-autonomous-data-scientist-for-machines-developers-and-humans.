import assert from "node:assert/strict"; import test from "node:test"; import { redactRecord } from "./redact.js";
test("redacts common sensitive fields", () => assert.equal(redactRecord({ email: "a@b.com", revenue: 2 }).email, "[REDACTED]"));
