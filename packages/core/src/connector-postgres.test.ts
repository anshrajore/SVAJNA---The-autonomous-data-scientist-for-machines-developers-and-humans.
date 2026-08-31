import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { PostgresDataSource } from "./connector-postgres.js";

describe("PostgresDataSource", () => {
  it("initializes postgres data source", async () => {
    const ds = new PostgresDataSource({ connectionString: "postgres://localhost/db", tableName: "events" });
    assert.equal(ds.id, "postgres:events");
    const meta = await ds.discover();
    assert.deepEqual(meta.columns, ["id", "created_at", "payload"]);
  });
});
