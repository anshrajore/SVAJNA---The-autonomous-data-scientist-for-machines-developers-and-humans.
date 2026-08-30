import assert from "node:assert/strict"; import test from "node:test"; import { artifactManifest } from "./artifact.js";
test("ties every artifact to a producing run", () => assert.equal(artifactManifest("r1", [{ id: "a", kind: "report", path: "x", createdAt: "now" }])[0].runId, "r1"));
