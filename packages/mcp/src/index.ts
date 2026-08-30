#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { relative, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { analyze, compareSchemas, loadDataset, profileDataset } from "@svajna/core";
import { z } from "zod";

const projectRoot = resolve(process.cwd());

function projectFile(source: string): string {
  const absolute = resolve(projectRoot, source);
  const pathFromRoot = relative(projectRoot, absolute);
  if (pathFromRoot.startsWith("..") || pathFromRoot === "" || pathFromRoot.includes("\0")) {
    throw new Error("Source must be a non-empty path inside the current SVAJNA project.");
  }
  return absolute;
}

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: "svajna", version: "0.1.0" });

  server.registerResource(
    "capabilities",
    "svajna://capabilities",
    { description: "SVAJNA Phase 2 MCP capabilities and operating constraints.", mimeType: "application/json" },
    async () => ({ contents: [{ uri: "svajna://capabilities", mimeType: "application/json", text: JSON.stringify({ name: "SVAJNA", phase: 2, tools: ["data_profile", "analysis_execute", "memory_read"], constraints: ["CSV and JSON only", "dataset inputs must be inside the project directory", "source datasets are never modified", "analysis artifacts are stored under .svajna/"] }, null, 2) }] }),
  );

  server.registerTool(
    "data_profile",
    {
      title: "Profile local data",
      description: "Read and deterministically profile a CSV or JSON dataset inside the current project. Does not modify the dataset or write artifacts.",
      inputSchema: { source: z.string().describe("Project-relative path to a .csv or .json dataset.") },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ source }) => {
      try {
        const absolute = projectFile(source);
        const dataset = await loadDataset(absolute);
        return text(profileDataset(source, dataset.format, dataset.rows));
      } catch (error) {
        return { content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }], isError: true };
      }
    },
  );

  server.registerTool(
    "data_compare",
    {
      title: "Compare two local dataset schemas",
      description: "Read two CSV or JSON datasets inside the project and report added, removed, or type-changed fields.",
      inputSchema: { before: z.string(), after: z.string() },
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ before, after }) => {
      try {
        const [left, right] = await Promise.all([loadDataset(projectFile(before)), loadDataset(projectFile(after))]);
        return text(compareSchemas(profileDataset(before, left.format, left.rows), profileDataset(after, right.format, right.rows)));
      } catch (error) { return { content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }], isError: true }; }
    },
  );

  server.registerTool(
    "analysis_execute",
    {
      title: "Create a reproducible analysis",
      description: "Run deterministic profiling for a project-local CSV or JSON dataset, then save an event log, report, and analytical memory under .svajna/. The source dataset is never changed.",
      inputSchema: { source: z.string().describe("Project-relative path to a .csv or .json dataset.") },
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ source }) => {
      try {
        const absolute = projectFile(source);
        const run = await analyze(absolute, projectRoot);
        return text({ runId: run.id, qualityScore: run.profile.quality.score, reportPath: relative(projectRoot, run.reportPath), findings: run.profile.quality.findings });
      } catch (error) {
        return { content: [{ type: "text" as const, text: error instanceof Error ? error.message : String(error) }], isError: true };
      }
    },
  );

  server.registerTool(
    "memory_read",
    {
      title: "Read analytical memory",
      description: "Read the latest local SVAJNA analysis memory for this project.",
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async () => {
      try { return text(JSON.parse(await readFile(join(projectRoot, ".svajna", "memory.json"), "utf8"))); }
      catch { return { content: [{ type: "text" as const, text: "No analytical memory exists yet. Run analysis_execute first." }], isError: true }; }
    },
  );

  server.registerPrompt(
    "review_analysis",
    { description: "A reusable prompt for evidence-based review of a SVAJNA analysis run.", argsSchema: { question: z.string().describe("The analytical question to review.") } },
    ({ question }) => ({ messages: [{ role: "user", content: { type: "text", text: `Review the SVAJNA analysis for: ${question}\n\nUse data_profile or analysis_execute, verify every conclusion against deterministic output, and clearly separate evidence from hypotheses.` } }] }),
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
}
