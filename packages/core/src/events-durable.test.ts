import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DurableEventStore } from "./events-durable.js";
import { JsonFileStore } from "./store-json.js";
import type { DomainEvent } from "./events.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("DurableEventStore", () => {
  it("persists and retrieves events", async () => {
    const dir = join(tmpdir(), `svajna-events-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<DomainEvent>(join(dir, "events.json"));
    const durable = new DurableEventStore(store);
    const event = await durable.append("analysis.started", { source: "test.csv" });
    assert.equal(event.type, "analysis.started");
    assert.equal(event.id, "analysis.started_1");
    const all = await durable.list();
    assert.equal(all.length, 1);
    const byType = await durable.list("analysis.started");
    assert.equal(byType.length, 1);
    const empty = await durable.list("nonexistent");
    assert.equal(empty.length, 0);
    const count = await durable.count();
    assert.equal(count, 1);
    const fetched = await durable.get("analysis.started_1");
    assert.deepEqual(fetched?.payload, { source: "test.csv" });
    await rm(dir, { recursive: true, force: true });
  });
});
