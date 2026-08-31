import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { SqliteDataSource } from "./connector-sqlite.js";

describe("SqliteDataSource", () => {
  it("initializes sqlite data source", async () => {
    const ds = new SqliteDataSource({ dbPath: ":memory:", tableName: "users" });
    assert.equal(ds.id, "sqlite:users");
    const meta = await ds.discover();
    assert.deepEqual(meta.columns, ["id", "created_at", "val"]);
  });
});
