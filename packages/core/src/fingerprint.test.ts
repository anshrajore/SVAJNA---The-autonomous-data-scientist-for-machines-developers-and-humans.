import assert from "node:assert/strict";
import test from "node:test";
import { fingerprintDataset } from "./fingerprint.js";
test("fingerprints rows independent of key order", () => assert.equal(fingerprintDataset([{ b: 2, a: 1 }]).value, fingerprintDataset([{ a: 1, b: 2 }]).value));
