# SVAJNA Architecture

## Principle

SVAJNA makes no analytical claim without deterministic evidence. LLMs may later plan and explain, but profiling, validation, data checks, workflow scheduling, and policies remain deterministic.

## Core flow

```text
source -> connector -> profile/statistics -> validation -> artifacts
                              |                    |
                          monitoring          memory/lineage
                              |                    |
                          incident rank      MCP / CLI report
```

## Safety boundary

The policy engine sits before high-impact actions. Local MCP paths are confined to the startup project directory. SQL validation only accepts read-only `SELECT`/`WITH` statements. Source datasets are never mutated by the current runtime.

## Next integration phase

Persist workflow, memory, approval, event, and monitoring records behind a durable store; then add database connectors under the `DataSource` contract.
