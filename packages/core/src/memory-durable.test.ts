import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { DurableMemory } from "./memory-durable.js";
import { JsonFileStore } from "./store-json.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("DurableMemory", () => {
  it("persists nodes and edges", async () => {
    const dir = join(tmpdir(), `svajna-mem-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<any>(join(dir, "memory.json"));
    const mem = new DurableMemory(store);
    await mem.add({ id: "ds1", type: "dataset", label: "sales.csv" });
    await mem.add({ id: "run1", type: "run", label: "analysis run" });
    await mem.link("run1", "ds1", "analyzed");
    const nodes = await mem.allNodes();
    assert.equal(nodes.length, 2);
    const edges = await mem.allEdges();
    assert.equal(edges.length, 1);
    assert.equal(edges[0]!.relation, "analyzed");
    const related = await mem.related("ds1");
    assert.equal(related.length, 1);
    const node = await mem.getNode("ds1");
    assert.equal(node?.label, "sales.csv");
    assert.equal(await mem.nodeCount(), 2);
    await assert.rejects(() => mem.link("run1", "nonexistent", "x"), /known nodes/);
    await rm(dir, { recursive: true, force: true });
  });
});
