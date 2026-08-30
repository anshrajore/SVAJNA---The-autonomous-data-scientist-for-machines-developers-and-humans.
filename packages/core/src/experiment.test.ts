import assert from "node:assert/strict"; import test from "node:test"; import { selectBestExperiment } from "./experiment.js";
test("selects a model using declared metric direction", () => assert.equal(selectBestExperiment([{ id: "a", metric: "rmse", value: 2, higherIsBetter: false }, { id: "b", metric: "rmse", value: 1, higherIsBetter: false }]).id, "b"));
