import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DurableWorkflowStore } from "./workflow-durable.js";
import { JsonFileStore } from "./store-json.js";
import type { WorkflowRecord } from "./workflow-durable.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("DurableWorkflowStore", () => {
  it("creates, advances, and completes workflows", async () => {
    const dir = join(tmpdir(), `svajna-wf-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<WorkflowRecord>(join(dir, "workflows.json"));
    const wf = new DurableWorkflowStore(store);
    const record = await wf.create("wf1", [{ id: "a" }, { id: "b", dependsOn: ["a"] }], ["a", "b"]);
    assert.equal(record.status, "pending");
    await wf.markRunning("wf1");
    const running = await wf.get("wf1");
    assert.equal(running?.status, "running");
    await wf.completeStep("wf1", "a");
    const partial = await wf.get("wf1");
    assert.equal(partial?.status, "running");
    assert.deepEqual(partial?.completedSteps, ["a"]);
    await wf.completeStep("wf1", "b");
    const done = await wf.get("wf1");
    assert.equal(done?.status, "completed");
    const all = await wf.list();
    assert.equal(all.length, 1);
    await rm(dir, { recursive: true, force: true });
  });

  it("fails a step", async () => {
    const dir = join(tmpdir(), `svajna-wf-fail-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<WorkflowRecord>(join(dir, "workflows.json"));
    const wf = new DurableWorkflowStore(store);
    await wf.create("wf2", [{ id: "x" }], ["x"]);
    await wf.failStep("wf2", "x", "Timeout");
    const failed = await wf.get("wf2");
    assert.equal(failed?.status, "failed");
    assert.equal(failed?.error, "Timeout");
    await rm(dir, { recursive: true, force: true });
  });
});
