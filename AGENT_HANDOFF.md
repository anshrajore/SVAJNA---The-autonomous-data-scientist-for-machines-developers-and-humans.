# SVAJNA Agent Handoff

## Product

SVAJNA is a local-first data science operating system with bounded autonomy and verifiable execution. The V1 focus is deterministic dataset profiling, quality checks, statistical evidence, reproducible artifacts, analytical memory, durable storage, database connectors, multi-step pipelines, machine learning algorithms, statistical data drift detection, and a modern Vite + React SPA web interface.

## Current phase

**Phase 5 — Machine Learning Primitives, Data Drift, & React SPA Web Interface (Complete & Pushed).**

Scope delivered in Phase 5:
- **ML Primitives**: Ordinary Least Squares (OLS) Linear Regression, K-Nearest Neighbors (KNN) Classifier, Decision Tree Stump, Confusion Matrix, and Regression Metrics (MSE, RMSE, MAE, R²).
- **Feature Engineering & Preprocessing**: `TransformationEngine`, `standardizeDataset`, `aggregateDataset`, `joinDatasets`, `filterDataset`, `exportDataset`, `calculateCorrelation`, `imputeMissing`, `capOutliers`, `scaleStandard`, `scaleMinMax`, `oneHotEncode`, `splitTrainTest`.
- **Model Registry & Drift Detection**: `ModelRegistry` for model artifact tracking & `detectDataDrift` for detecting statistical mean drift.
- **CLI & MCP Tools**: Added `svajna drift` CLI command and `data_drift` MCP tool.
- **`@svajna/web` React SPA**: Upgraded to React 18 + Vite SPA with multi-page navigation (Home, Docs, Playground, MCP), live terminal simulator, dataset drag-and-drop profiler, and color-coded row-level diff viewer.

## Architecture

- `packages/core`: pure analysis runtime, durable storage abstractions, ML algorithms, statistics engines, connectors, diff engine, audit trail, notifications.
- `packages/cli`: `svajna init`, `svajna analyze`, `svajna pipeline`, `svajna drift`, `svajna report`, `svajna status`.
- `packages/mcp`: stdio MCP server exposing `data_profile`, `data_compare`, `analysis_execute`, `pipeline_execute`, `data_drift`, `memory_read`.
- `packages/web`: Vite + React SPA data science workbench and portfolio interface.

## Dependencies

- Runtime: Node.js 20+, `@modelcontextprotocol/sdk` 1.25+, `zod` 3.24+, `react` 18.3+, `vite` 6.0+.
- Development: TypeScript 5.7+, `@types/node` 22.10+.
- Install with `npm install`; run `npm run build`, `npm test`, and `npm run lint` from repo root.

## Persistence and safety

- All project state is under `.svajna/` and is excluded from Git.
- All 25 commits configured and pushed using `anshrajore1266@gmail.com`.
