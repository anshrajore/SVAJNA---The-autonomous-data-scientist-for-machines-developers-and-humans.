import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DurableApprovalStore } from "./approval-durable.js";
import { JsonFileStore } from "./store-json.js";
import type { ApprovalRequest } from "./approval.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("DurableApprovalStore", () => {
  it("requests, lists pending, and resolves approvals", async () => {
    const dir = join(tmpdir(), `svajna-appr-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<ApprovalRequest>(join(dir, "approvals.json"));
    const apprStore = new DurableApprovalStore(store);

    const req1 = await apprStore.request("appr1", "sql.write");
    assert.equal(req1.status, "pending");

    const pending = await apprStore.pending();
    assert.equal(pending.length, 1);
    assert.equal(pending[0]!.id, "appr1");

    const res1 = await apprStore.resolve("appr1", true);
    assert.equal(res1.status, "approved");

    const pendingAfter = await apprStore.pending();
    assert.equal(pendingAfter.length, 0);

    const all = await apprStore.list();
    assert.equal(all.length, 1);

    await rm(dir, { recursive: true, force: true });
  });
});
