import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { ModelRegistry } from "./model-registry.js";

describe("ModelRegistry", () => {
  it("registers and lists trained models", () => {
    const reg = new ModelRegistry();
    const model = reg.register({ id: "m1", name: "LinearReg", type: "ols", version: 1, metrics: { r2: 0.95 } });
    assert.equal(reg.get("m1")?.name, "LinearReg");
    assert.equal(reg.list().length, 1);
  });
});
