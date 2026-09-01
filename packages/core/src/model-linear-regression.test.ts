import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { trainSimpleLinearRegression } from "./model-linear-regression.js";

describe("trainSimpleLinearRegression", () => {
  it("fits OLS slope and intercept accurately", () => {
    const rows = [{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }];
    const model = trainSimpleLinearRegression(rows, "x", "y");
    assert.equal(Math.round(model.slope), 2);
    assert.equal(Math.round(model.intercept), 1);
    assert.equal(model.predict(4), 9);
  });
});
