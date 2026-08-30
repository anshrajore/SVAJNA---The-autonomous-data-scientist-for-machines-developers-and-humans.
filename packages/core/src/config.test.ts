import assert from "node:assert/strict";
import test from "node:test";
import { defaultConfig, parseConfig } from "./config.js";

test("applies safe configuration defaults", () => assert.deepEqual(parseConfig({ projectName: "Revenue" }), { ...defaultConfig, projectName: "Revenue" }));
test("rejects unsafe autonomy configuration", () => assert.throws(() => parseConfig({ autonomy: 9 }), /0 to 6/));
