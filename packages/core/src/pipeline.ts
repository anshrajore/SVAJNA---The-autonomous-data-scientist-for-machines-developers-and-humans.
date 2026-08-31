import type { DatasetProfile } from "./types.js";
import { profileDataset } from "./profile.js";
import { loadDataset } from "./parse.js";

export type StepType = "profile" | "validate" | "report";

export interface PipelineStepConfig {
  name: string;
  type: StepType;
}

export interface PipelineResult {
  id: string;
  source: string;
  profile: DatasetProfile;
  stepsCompleted: string[];
  executedAt: string;
}

/**
 * Pipeline engine for executing chained analysis operations on datasets.
 */
export class PipelineEngine {
  constructor(private readonly steps: PipelineStepConfig[] = [{ name: "profile", type: "profile" }]) {}

  async execute(sourcePath: string): Promise<PipelineResult> {
    const dataset = await loadDataset(sourcePath);
    const profile = profileDataset(sourcePath, dataset.format, dataset.rows);
    const stepsCompleted: string[] = [];

    for (const step of this.steps) {
      if (step.type === "profile") {
        stepsCompleted.push(step.name);
      } else if (step.type === "validate") {
        stepsCompleted.push(step.name);
      } else if (step.type === "report") {
        stepsCompleted.push(step.name);
      }
    }

    return {
      id: `pipe_${Date.now()}`,
      source: sourcePath,
      profile,
      stepsCompleted,
      executedAt: new Date().toISOString(),
    };
  }
}
