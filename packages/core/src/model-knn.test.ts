import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { trainKNNClassifier } from "./model-knn.js";

describe("trainKNNClassifier", () => {
  it("classifies nearest neighbors based on euclidean distance", () => {
    const train = [
      { x: 1, y: 1, label: "A" },
      { x: 1, y: 2, label: "A" },
      { x: 10, y: 10, label: "B" },
    ];
    const knn = trainKNNClassifier(train, "label", 1);
    const pred = knn.predict({ x: 1.5, y: 1.5 }, ["x", "y"]);
    assert.equal(pred, "A");
  });
});
