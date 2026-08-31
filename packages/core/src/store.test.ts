import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { JsonFileStore } from "./store-json.js";
import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("Store interface", () => {
  it("exports Store type", async () => {
    // Type-level check — Store is an interface, but JsonFileStore implements it
    const dir = join(tmpdir(), `svajna-store-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const store = new JsonFileStore<{ name: string }>(join(dir, "test.json"));
    assert.equal(await store.has("x"), false);
    assert.deepEqual(await store.keys(), []);
    assert.deepEqual(await store.all(), []);
    await store.put("a", { name: "alpha" });
    assert.equal(await store.has("a"), true);
    assert.deepEqual(await store.get("a"), { name: "alpha" });
    assert.deepEqual(await store.keys(), ["a"]);
    assert.equal(await store.delete("a"), true);
    assert.equal(await store.has("a"), false);
    assert.equal(await store.delete("a"), false);
    await rm(dir, { recursive: true, force: true });
  });
});
