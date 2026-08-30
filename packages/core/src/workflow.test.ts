import assert from "node:assert/strict"; import test from "node:test"; import { topologicalPlan } from "./workflow.js";
test("orders a workflow DAG", () => assert.deepEqual(topologicalPlan([{ id: "profile" }, { id: "report", dependsOn: ["profile"] }]), ["profile", "report"]));
