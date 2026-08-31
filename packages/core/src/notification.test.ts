import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { NotificationDispatcher } from "./notification.js";
import type { Notification } from "./notification.js";

describe("NotificationDispatcher", () => {
  it("dispatches notifications to subscribers", async () => {
    const dispatcher = new NotificationDispatcher();
    const received: Notification[] = [];
    dispatcher.subscribe((n) => { received.push(n); });

    const n = await dispatcher.dispatch("warning", "Quality drop detected");
    assert.equal(received.length, 1);
    assert.equal(received[0]!.message, "Quality drop detected");
    assert.equal(n.severity, "warning");
  });
});
