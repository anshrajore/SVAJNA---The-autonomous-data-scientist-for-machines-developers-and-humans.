import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { ConnectorRegistry } from "./connector-registry.js";
import { InMemoryDataSource } from "./connector.js";

describe("ConnectorRegistry", () => {
  it("registers, lists, gets, and unregisters connectors", () => {
    const reg = new ConnectorRegistry();
    const ds1 = new InMemoryDataSource("ds1", [], () => ({} as any));
    reg.register(ds1);
    assert.equal(reg.get("ds1"), ds1);
    assert.equal(reg.list().length, 1);
    assert.throws(() => reg.register(ds1), /already registered/);
    assert.equal(reg.unregister("ds1"), true);
    assert.equal(reg.list().length, 0);
  });
});
