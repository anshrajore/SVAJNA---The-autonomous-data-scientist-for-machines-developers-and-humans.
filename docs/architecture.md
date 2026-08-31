# SVAJNA Architecture

## Principle

SVAJNA makes no analytical claim without deterministic evidence. LLMs may later plan and explain, but profiling, validation, data checks, workflow scheduling, and policies remain deterministic.

## Core flow

```text
source -> connector -> profile/statistics -> validation -> artifacts
                              |                    |
                          monitoring          memory/lineage
                              |                    |
                          incident rank      MCP / CLI report / Web UI
```

## Packages

- `packages/core`: pure analysis runtime, durable persistence (JSON stores), SQL validation, diff engine, audit trail, notification dispatcher, and connectors.
- `packages/cli`: `svajna init`, `svajna analyze`, `svajna pipeline`, `svajna report`, `svajna status`.
- `packages/mcp`: stdio MCP server exposing `data_profile`, `data_compare`, `analysis_execute`, `pipeline_execute`, `memory_read`.
- `packages/web`: Hanzo product designer portfolio & autonomous data science workspace interface.

## Safety boundary

The policy engine sits before high-impact actions. Local MCP paths are confined to the startup project directory. SQL validation only accepts read-only `SELECT`/`WITH` statements. Source datasets are never mutated by the current runtime. All persistent state is recorded deterministically in JSON file stores under `.svajna/`.
