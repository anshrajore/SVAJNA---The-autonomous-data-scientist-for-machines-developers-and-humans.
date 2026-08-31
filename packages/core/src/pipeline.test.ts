import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import { PipelineEngine } from "./pipeline.js";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("PipelineEngine", () => {
  it("executes a multi-step pipeline on a dataset", async () => {
    const dir = join(tmpdir(), `svajna-pipe-test-${Date.now()}`);
    await mkdir(dir, { recursive: true });
    const csvFile = join(dir, "data.csv");
    await writeFile(csvFile, "id,val\n1,10\n2,20\n", "utf8");

    const pipe = new PipelineEngine([
      { name: "step_profile", type: "profile" },
      { name: "step_validate", type: "validate" },
    ]);

    const res = await pipe.execute(csvFile);
    assert.equal(res.profile.rowCount, 2);
    assert.deepEqual(res.stepsCompleted, ["step_profile", "step_validate"]);

    await rm(dir, { recursive: true, force: true });
  });
});
