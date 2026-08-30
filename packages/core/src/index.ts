import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { loadDataset } from "./parse.js";
import { profileDataset } from "./profile.js";
import type { AnalysisEvent, AnalysisRun, DatasetProfile } from "./types.js";

export * from "./types.js";
export * from "./config.js";
export * from "./fingerprint.js";
export * from "./connector.js";
export * from "./statistics.js";
export * from "./anomaly.js";
export * from "./compare.js";
export * from "./validation.js";
export * from "./policy.js";
export * from "./approval.js";
export * from "./workflow.js";
export * from "./events.js";
export * from "./monitor.js";
export * from "./incident.js";
export * from "./memory.js";
export * from "./sql.js";
export * from "./artifact.js";
export * from "./experiment.js";
export * from "./lineage.js";
export * from "./sample.js";
export * from "./rules.js";
export * from "./redact.js";
export { loadDataset, parseCsv } from "./parse.js";
export { profileDataset } from "./profile.js";

export async function analyze(source: string, projectDirectory = process.cwd()): Promise<AnalysisRun> {
  const started = performance.now();
  const id = `run_${new Date().toISOString().replace(/[-:.TZ]/g, "")}_${Math.random().toString(36).slice(2, 8)}`;
  const events: AnalysisEvent[] = [{ event: "analysis.started", taskId: id, phase: "discovery", operation: "load_dataset", status: "success", timestamp: new Date().toISOString() }];
  const absoluteSource = resolve(source);
  const dataset = await loadDataset(absoluteSource);
  events.push({ event: "analysis.step.completed", taskId: id, phase: "discovery", operation: "load_dataset", status: "success", timestamp: new Date().toISOString(), durationMs: Math.round(performance.now() - started) });
  const profile: DatasetProfile = profileDataset(absoluteSource, dataset.format, dataset.rows);
  events.push({ event: "analysis.step.completed", taskId: id, phase: "profiling", operation: "profile_dataset", status: "success", timestamp: new Date().toISOString() });
  const state = join(projectDirectory, ".svajna");
  await mkdir(join(state, "runs"), { recursive: true });
  await mkdir(join(state, "reports"), { recursive: true });
  const reportPath = join(state, "reports", `${id}.md`);
  const report = renderReport(profile, id);
  await writeFile(reportPath, report, "utf8");
  events.push({ event: "analysis.step.completed", taskId: id, phase: "reporting", operation: "write_report", status: "success", timestamp: new Date().toISOString(), artifacts: [reportPath] });
  events.push({ event: "analysis.completed", taskId: id, phase: "reporting", operation: "analyze", status: "success", timestamp: new Date().toISOString(), durationMs: Math.round(performance.now() - started), artifacts: [reportPath] });
  const run: AnalysisRun = { id, createdAt: new Date().toISOString(), profile, events, reportPath };
  await writeFile(join(state, "runs", `${id}.json`), JSON.stringify(run, null, 2), "utf8");
  await writeFile(join(state, "memory.json"), JSON.stringify({ latestRun: id, datasets: [{ source: absoluteSource, name: basename(absoluteSource), runId: id, analyzedAt: run.createdAt, qualityScore: profile.quality.score }] }, null, 2), "utf8");
  return run;
}

export function renderReport(profile: DatasetProfile, runId: string): string {
  const findings = profile.quality.findings.length ? profile.quality.findings.map((finding) => `- **${finding.severity.toUpperCase()}** ${finding.column ? `\`${finding.column}\`: ` : ""}${finding.message}`).join("\n") : "- No quality issues detected.";
  const columns = profile.columns.map((column) => `| ${column.name} | ${column.kind} | ${column.present} | ${column.missing} | ${column.distinct} |`).join("\n");
  return `# SVAJNA Analysis Report\n\n- Run: \`${runId}\`\n- Source: \`${profile.source}\`\n- Format: ${profile.format}\n- Rows: ${profile.rowCount}\n- Quality score: **${profile.quality.score}/100**\n\n## Schema\n\n| Column | Type | Present | Missing | Distinct |\n| --- | --- | ---: | ---: | ---: |\n${columns}\n\n## Quality findings\n\n${findings}\n\n## Reproducibility\n\nThis report was created by deterministic local profiling. Source data was not modified. The corresponding event log is stored in \`.svajna/runs/${runId}.json\`.\n`;
}
