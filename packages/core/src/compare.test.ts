import assert from "node:assert/strict";
import test from "node:test";
import { compareSchemas } from "./compare.js";
test("reports added and changed schema fields", () => { const p = (columns: any[]) => ({ columns }) as any; assert.deepEqual(compareSchemas(p([{ name: "id", kind: "number" }]), p([{ name: "id", kind: "string" }, { name: "new", kind: "string" }])), { added: ["new"], removed: [], typeChanged: [{ column: "id", before: "number", after: "string" }] }); });
