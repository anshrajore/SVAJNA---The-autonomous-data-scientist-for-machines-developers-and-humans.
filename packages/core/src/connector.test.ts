import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryDataSource } from "./connector.js";
test("samples a connector without mutation", async () => { const source = new InMemoryDataSource("test", [{ id: 1 }, { id: 2 }], () => { throw new Error("unused"); }); assert.deepEqual(await source.sample(1), [{ id: 1 }]); });
