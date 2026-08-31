# SVAJNA Agent Handoff

## Product

SVAJNA is a local-first data science operating system with bounded autonomy and verifiable execution. The V1 focus is deterministic dataset profiling, quality checks, statistical evidence, reproducible artifacts, analytical memory, durable storage, database connectors, multi-step pipelines, and a modern web interface.

## Current phase

**Phase 4 — Durable Persistence, Connectors, Pipelines, & Web Interface (Complete & Pushed).**

Scope delivered in Phase 4:
- Abstract `Store<T>` interface and concrete `JsonFileStore<T>` for local file-backed persistence.
- `DurableEventStore` for persistent domain event streams.
- `DurableMemory` graph for persisting analytical nodes, edges, and lineage.
- `DurableWorkflowStore` for tracking multi-step workflow execution, step completion, and error states.
- `DurableApprovalStore` for managing human-in-the-loop approval requests.
- `SqliteDataSource` & `PostgresDataSource` connector implementations under provider-neutral `DataSource` contract.
- `ConnectorRegistry` for dynamic data source registration and lookup.
- `diffRows` row-level data diff engine.
- `AuditTrailStore` for immutable user/system action logging.
- `NotificationDispatcher` for alert subscriptions and dispatch.
- `detectSchemaMigration` for schema breaking-change detection.
- `PipelineEngine` for chained dataset execution.
- CLI `svajna pipeline` command.
- MCP `pipeline_execute` tool.
- `@svajna/web` package featuring the Hanzo Product Designer portfolio & SVAJNA workspace UI (matching design specs).

## Architecture

- `packages/core`: pure analysis runtime, durable storage abstractions, SQL safety, connectors, diff engine, audit trail, notifications, schema migration detector, and pipeline engine.
- `packages/cli`: `svajna init`, `svajna analyze`, `svajna pipeline`, `svajna report`, `svajna status`.
- `packages/mcp`: stdio MCP server exposing `data_profile`, `data_compare`, `analysis_execute`, `pipeline_execute`, and `memory_read`.
- `packages/web`: HTML/CSS portfolio UI inspired by Hanzo design ("I'm Hanzo, a Product Designer based in Tokyo").

## Dependencies

- Runtime: Node.js 20+, `@modelcontextprotocol/sdk` 1.25+, and `zod` 3.24+ for MCP input schemas.
- Development: TypeScript 5.7+, `@types/node` 22.10+.
- Install with `npm install`; run `npm run build`, `npm test`, and `npm run lint` from repo root.

## Persistence and safety

- All project state is under `.svajna/` and is excluded from Git.
- `analyze` and `pipeline` are read-only with respect to source data, writing artifacts under `.svajna/`.
- MCP server enforces strict path confinement inside the current working directory.
- All commits configured using `anshrajore1266@gmail.com`.
