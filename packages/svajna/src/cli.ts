#!/usr/bin/env node
import { access, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { analyze, loadConfig, PipelineEngine, loadDataset, detectDataDrift } from "@svajna/core";

const [command, argument, extraArg] = process.argv.slice(2);

function usage(): void {
  console.log("SVAJNA — autonomous data science with verifiable execution\n\nUsage:\n  svajna init\n  svajna analyze <data.csv|data.json>\n  svajna pipeline <data.csv|data.json>\n  svajna drift <baseline.json> <current.json> <column>\n  svajna report\n  svajna status");
}

async function main(): Promise<void> {
  if (!command || command === "--help" || command === "-h") return usage();
  if (command === "init") {
    await mkdir(join(process.cwd(), ".svajna", "runs"), { recursive: true });
    await mkdir(join(process.cwd(), ".svajna", "reports"), { recursive: true });
    console.log("Initialized SVAJNA project state in .svajna/");
    return;
  }
  if (command === "analyze") {
    if (!argument) throw new Error("Provide a CSV or JSON file: svajna analyze ./data.csv");
    const run = await analyze(argument);
    console.log(`Analysis complete: ${run.id}\nRows: ${run.profile.rowCount}\nColumns: ${run.profile.columns.length}\nQuality: ${run.profile.quality.score}/100\nReport: ${run.reportPath}`);
    return;
  }
  if (command === "pipeline") {
    if (!argument) throw new Error("Provide a CSV or JSON file: svajna pipeline ./data.csv");
    const pipe = new PipelineEngine([
      { name: "profile", type: "profile" },
      { name: "validate", type: "validate" },
      { name: "report", type: "report" },
    ]);
    const res = await pipe.execute(argument);
    console.log(`Pipeline executed: ${res.id}\nSource: ${res.source}\nSteps completed: ${res.stepsCompleted.join(", ")}\nQuality score: ${res.profile.quality.score}/100`);
    return;
  }
  if (command === "drift") {
    if (!argument || !extraArg || !process.argv[5]) {
      throw new Error("Usage: svajna drift <baseline.json> <current.json> <column>");
    }
    const [base, curr] = await Promise.all([loadDataset(argument), loadDataset(extraArg)]);
    const report = detectDataDrift(base.rows, curr.rows, process.argv[5]);
    console.log(`Drift Analysis (${report.column}):\nDrift Detected: ${report.driftDetected ? "YES" : "NO"}\nBaseline Mean: ${report.baselineMean}\nCurrent Mean: ${report.currentMean}\nRatio: ${(report.differenceRatio * 100).toFixed(2)}%`);
    return;
  }
  if (command === "report") {
    const memoryPath = join(process.cwd(), ".svajna", "memory.json");
    try { await access(memoryPath); }
    catch { throw new Error("No analysis has been run. Use: svajna analyze <file>"); }
    const memory = JSON.parse(await readFile(memoryPath, "utf8")) as { latestRun: string };
    console.log(`Latest report: .svajna/reports/${memory.latestRun}.md`);
    return;
  }
  if (command === "status") {
    const config = await loadConfig();
    const memoryPath = join(process.cwd(), ".svajna", "memory.json");
    let latestRun = "none";
    try { latestRun = (JSON.parse(await readFile(memoryPath, "utf8")) as { latestRun: string }).latestRun; } catch { /* no state */ }
    console.log(`Project: ${config.projectName}\nAutonomy: ${config.autonomy}\nMonitoring: ${config.monitoring.enabled ? config.monitoring.sensitivity : "disabled"}\nLatest run: ${latestRun}`);
    return;
  }
  throw new Error(`Unknown command '${command}'.`);
}

main().catch((error: unknown) => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
