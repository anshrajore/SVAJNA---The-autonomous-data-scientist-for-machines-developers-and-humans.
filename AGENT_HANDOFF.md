# SVAJNA Agent Handoff

## Product

SVAJNA is a local-first data science operating system with bounded autonomy and verifiable execution. The V1 focus is deterministic dataset profiling, quality checks, statistical evidence, reproducible artifacts, analytical memory, and an MCP-facing interface.

## Current phase

**Phase 1 — local analysis foundation (complete, commit pending).**

Scope: CSV and JSON discovery, schema inference, data-quality profiling, a deterministic report, event log, project memory, and a CLI. No LLM, remote execution, database writes, model training, or autonomous interventions are in scope yet.

Validated with `npm run lint`, `npm test`, `npm run build`, and a CLI smoke test against a CSV with duplicate and missing values.

## Architecture

- `packages/core`: pure analysis runtime; parses files, profiles data, records run events and report artifacts.
- `packages/cli`: `svajna init`, `svajna analyze`, `svajna report` commands.
- Future packages: `mcp`, `connectors`, `runtime`, and `web`. Keep the core provider-independent.

## Dependencies

- Runtime: Node.js 20+ only in Phase 1 (no production dependencies).
- Development: TypeScript 5.7+, `@types/node` 22.10+.
- Install with `npm install`; run `npm run build`, `npm test`, and `npm run lint` from repo root.

## Persistence and safety

- All project state is under `.svajna/` and is excluded from Git.
- `analyze` is read-only except for writing its run/report/memory artifacts into `.svajna/`.
- Destructive or external actions must later pass an explicit policy/approval layer.

## Git conventions

- Configure commits using `anshrajore1266@gmail.com`.
- Commit each completed phase and push it to `origin/main`.
- Update this document whenever dependencies, architecture, commands, or phase status change.
