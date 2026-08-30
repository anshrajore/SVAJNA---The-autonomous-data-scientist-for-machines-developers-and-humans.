import assert from "node:assert/strict"; import test from "node:test"; import { rankCauses } from "./incident.js";
test("ranks likely incident causes by evidence", () => assert.equal(rankCauses([{ name: "a", evidenceScore: .9, temporalScore: .8 }, { name: "b", evidenceScore: .2, temporalScore: 1 }])[0].name, "a"));
