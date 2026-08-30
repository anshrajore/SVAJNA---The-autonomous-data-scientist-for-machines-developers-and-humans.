import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ProjectConfig {
  version: 1;
  autonomy: AutonomyLevel;
  projectName: string;
  monitoring: { enabled: boolean; sensitivity: "low" | "medium" | "high" };
}

export const defaultConfig: ProjectConfig = {
  version: 1,
  autonomy: 1,
  projectName: "SVAJNA project",
  monitoring: { enabled: false, sensitivity: "medium" },
};

function isAutonomyLevel(value: unknown): value is AutonomyLevel {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function parseConfig(value: unknown): ProjectConfig {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Configuration must be a JSON object.");
  const input = value as Record<string, unknown>;
  if (input.version !== undefined && input.version !== 1) throw new Error("Unsupported SVAJNA configuration version.");
  if (input.autonomy !== undefined && !isAutonomyLevel(input.autonomy)) throw new Error("autonomy must be an integer from 0 to 6.");
  const monitoring = input.monitoring;
  if (monitoring !== undefined && (monitoring === null || typeof monitoring !== "object" || Array.isArray(monitoring))) throw new Error("monitoring must be an object.");
  const monitor = monitoring as Record<string, unknown> | undefined;
  if (monitor?.enabled !== undefined && typeof monitor.enabled !== "boolean") throw new Error("monitoring.enabled must be boolean.");
  if (monitor?.sensitivity !== undefined && !["low", "medium", "high"].includes(String(monitor.sensitivity))) throw new Error("monitoring.sensitivity must be low, medium, or high.");
  if (input.projectName !== undefined && (typeof input.projectName !== "string" || input.projectName.trim() === "")) throw new Error("projectName must be a non-empty string.");
  return { version: 1, autonomy: input.autonomy as AutonomyLevel ?? defaultConfig.autonomy, projectName: input.projectName as string ?? defaultConfig.projectName, monitoring: { enabled: monitor?.enabled as boolean ?? defaultConfig.monitoring.enabled, sensitivity: monitor?.sensitivity as ProjectConfig["monitoring"]["sensitivity"] ?? defaultConfig.monitoring.sensitivity } };
}

export async function loadConfig(projectDirectory = process.cwd()): Promise<ProjectConfig> {
  try { return parseConfig(JSON.parse(await readFile(join(projectDirectory, "svajna.config.json"), "utf8"))); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaultConfig;
    throw error;
  }
}
