import assert from "node:assert/strict"; import test from "node:test"; import { validateReadOnlySql } from "./sql.js";
test("blocks mutation SQL", () => assert.equal(validateReadOnlySql("DELETE FROM sales").valid, false));
