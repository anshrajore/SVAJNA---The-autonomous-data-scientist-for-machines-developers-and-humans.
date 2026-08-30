# SVAJNA Agent Handoff

## Product

SVAJNA is a local-first data science operating system with bounded autonomy and verifiable execution. The V1 focus is deterministic dataset profiling, quality checks, statistical evidence, reproducible artifacts, analytical memory, and an MCP-facing interface.

## Current phase

**Phase 2 — MCP interface (complete, commit pending).**

Scope: CSV and JSON discovery, schema inference, data-quality profiling, a deterministic report, event log, project memory, and a CLI. No LLM, remote execution, database writes, model training, or autonomous interventions are in scope yet.

Phase 1 was committed and pushed as `51a663e`.

Phase 2 adds a local stdio MCP server with project-bounded filesystem access. It exposes `data_profile` (non-persistent), `analysis_execute` (writes only SVAJNA artifacts), `memory_read`, a capabilities resource, and an evidence-review prompt. It uses the maintained MCP TypeScript SDK. Validated with `npm run lint`, `npm test`, `npm run build`, and CLI analysis smoke tests.

## Architecture

- `packages/core`: pure analysis runtime; parses files, profiles data, records run events and report artifacts.
- `packages/cli`: `svajna init`, `svajna analyze`, `svajna report` commands.
- `packages/mcp`: stdio MCP server for the local core runtime, with source paths constrained to its working directory.
- Future packages: `connectors`, `runtime`, and `web`. Keep the core provider-independent.

## Dependencies

- Runtime: Node.js 20+, `@modelcontextprotocol/sdk` 1.25+, and `zod` 3.24+ for MCP input schemas.
- Development: TypeScript 5.7+, `@types/node` 22.10+.
- Install with `npm install`; run `npm run build`, `npm test`, and `npm run lint` from repo root.

## Persistence and safety

- All project state is under `.svajna/` and is excluded from Git.
- `analyze` is read-only except for writing its run/report/memory artifacts into `.svajna/`.
- The MCP server refuses paths outside its startup working directory; `analysis_execute` has no data-source write capability.
- Destructive or external actions must later pass an explicit policy/approval layer.

## Git conventions

- Configure commits using `anshrajore1266@gmail.com`.
- Commit each completed phase and push it to `origin/main`.
- Update this document whenever dependencies, architecture, commands, or phase status change.
