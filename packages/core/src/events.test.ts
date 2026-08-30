import assert from "node:assert/strict"; import test from "node:test"; import { EventStore } from "./events.js";
test("keeps an append-only event stream", () => { const events = new EventStore(); events.append("run.completed", {}); assert.equal(events.list("run.completed").length, 1); });
