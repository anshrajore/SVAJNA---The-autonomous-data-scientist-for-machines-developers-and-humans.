import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { AuditTrailStore } from "./audit.js";
import { JsonFileStore } from "./store-json.js";
import type { AuditRecord } from "./audit.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("AuditTrailStore", () => {
  it("logs and retrieves audit records", async () => {
    const dir = join(tmpdir(), `svajna-audit-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<AuditRecord>(join(dir, "audit.json"));
    const audit = new AuditTrailStore(store);

    await audit.log("user:1266", "analyze", "sales.csv");
    assert.equal(await audit.count(), 1);

    const logs = await audit.list("user:1266");
    assert.equal(logs.length, 1);
    assert.equal(logs[0]!.action, "analyze");

    await rm(dir, { recursive: true, force: true });
  });
});
