# SVAJNA — Production Architecture, Implementation Backlog & Engineering Roadmap

**From Prototype to a Market-Ready Autonomous Data Science Operating System**  
**Author & Lead Architect:** ANSH RAJORE  
**Repository:** [github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git](https://github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git)  
**Status:** In Active Execution  

---

## 1. Product Definition & 5-Layer Plane Architecture

SVAJNA is structured into five cohesive, enterprise-grade planes:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. EXPERIENCE PLANE                                                         │
│    Landing Page · 12-Col Workspace · Model Studio · Live Monitoring · ⌘K   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CONTROL PLANE                                                            │
│    Project Auth · RBAC · Policy Guardrails · Job Queue · Approval Gates     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. AUTONOMOUS AGENT PLANE                                                   │
│    Planner · Tool Registry · Hypothesis Engine · Critic · Evidence Ledger   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ANALYTICS PLANE                                                          │
│    SQL Engine · Statistics · Auto-Prep · AutoML Benchmarks · Visualization  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. DATA PLANE                                                               │
│    File Ingestion · Connectors · Streaming Ingestion · Schema & Drift Finger │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Architectural Mandate
> **Deterministic Tool Invocation Over Hallucination:** The AI agent must not invent analytical results or calculate statistics inside an LLM context window. It formulates plans, invokes deterministic tools (`run_sql`, `calculate_statistics`, `train_model`, `render_chart`), and anchors its explanations directly to verifiable computation outputs.

---

## 2. Codebase Inventory & Module Audit

### 2.1 Existing Preserved Modules in `@svajna/core` (58 Test Suites Passing)
- **Connectors**: `connector-postgres.ts`, `connector-sqlite.ts`, `connector-registry.ts`
- **Data Transformations**: `aggregation-engine.ts`, `impute-engine.ts`, `join-engine.ts`, `filter-engine.ts`, `encoder-onehot.ts`, `minmax-scaler.ts`, `scaler-engine.ts`, `outlier-engine.ts`, `schema-standardizer.ts`, `train-test-splitter.ts`
- **Statistical Analytics**: `statistics.ts`, `correlation-engine.ts`, `metrics-regression.ts`, `metrics-classification.ts`
- **Machine Learning**: `model-linear-regression.ts`, `model-knn.ts`, `model-decision-stump.ts`, `model-registry.ts`
- **Governance, Lineage & Durability**: `approval-durable.ts`, `audit.ts`, `events-durable.ts`, `memory-durable.ts`, `workflow-durable.ts`, `policy.ts`, `data-drift.ts`, `anomaly.ts`, `fingerprint.ts`, `validation.ts`

### 2.2 Existing Preserved Modules in `@svajna/web`
- **Product Experience**:
  - `Page 1: Landing Page`: "Your data scientist. Always investigating."
  - `Page 2: Autonomous Workspace`: 12-column infinite grid, query-driven charts, evidence cards, root-cause tree, interactive data table.
  - `Page 3: Model Studio`: AutoML leaderboard, 70/15/15 train/val/test isolation, permutation feature importance, residual plots, prediction explorer.
  - `Page 4: Live Monitoring`: Freshness tracking, detection latency in ms, statistical drift alerts with Shewhart bounds, approval actions.
- **Autonomous & ML Engines**:
  - `visualization-engine.ts`: Deterministic execution of `VisualizationSpec`.
  - `automl-studio.ts`: Leaderboard benchmark with baseline comparisons.
  - `monitoring-engine.ts`: Streaming telemetry, drift shifts, queue depth.
  - `autonomous-agent.ts`: Cognitive agent reasoning loop.
  - `investigation-graph.ts`: Hierarchical root-cause tree builder.
  - `quality-autopilot.ts`: Missingness bias and IQR outlier capping.
  - `hypothesis-engine.ts`: Automated hypothesis tests with $p$-values.
  - `report-generator.ts`: Markdown and HTML report generation.
  - `geo-mapper.ts`: Geographic spatial mapping engine.

---

## 3. Exact API Contracts & Database Schemas

### 3.1 PostgreSQL Relational Schema (Control & Analytics Metadata)

```sql
-- Projects & Access Control
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datasets & Versioned Snapshots
CREATE TABLE dataset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'csv', 'json', 'postgres', 'sqlite', 'stream'
    row_count INT NOT NULL,
    column_count INT NOT NULL,
    content_fingerprint VARCHAR(64) NOT NULL, -- SHA-256
    schema_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query Execution Ledger
CREATE TABLE query_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_version_id UUID REFERENCES dataset_versions(id),
    query_text TEXT NOT NULL,
    execution_time_ms INT NOT NULL,
    result_rows INT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Registry & Leaderboard Artifacts
CREATE TABLE model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    name VARCHAR(255) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    problem_type VARCHAR(50) NOT NULL, -- 'regression', 'classification'
    status VARCHAR(50) NOT NULL,       -- 'candidate', 'validated', 'deployed'
    split_strategy JSONB NOT NULL,     -- {train: 0.7, val: 0.15, test: 0.15}
    val_metrics JSONB NOT NULL,
    test_metrics JSONB NOT NULL,
    feature_importance JSONB NOT NULL,
    artifact_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit & Governance Lineage
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    sha256_proof VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Typed Query & Visualization API Contracts

```typescript
export interface VisualizationSpec {
  id: string;
  datasetVersionId: string;
  queryId: string;
  title: string;
  chartType: "line" | "bar" | "scatter" | "histogram" | "heatmap" | "boxplot" | "residual" | "feature_importance";
  xField?: string;
  yFields: string[];
  aggregation?: "sum" | "avg" | "count" | "min" | "max";
  groupBy?: string;
  sortBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  filters: Array<{
    field: string;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
    value: unknown;
  }>;
}

export interface VisualizationResult {
  spec: VisualizationSpec;
  metadata: {
    queryId: string;
    executedAt: string;
    executionTimeMs: number;
    inputRowCount: number;
    filteredRowCount: number;
    datasetVersionId: string;
    cacheHit: boolean;
  };
  data: Record<string, unknown>[];
  summary: {
    totalPoints: number;
    metrics: Record<string, { min: number; max: number; avg: number; sum: number }>;
  };
}
```

---

## 4. Sequence of 10 Testable Pull Requests (Roadmap)

| Phase | Milestone | Pull Request Scope | Verification Exit Gate |
| :---: | :--- | :--- | :--- |
| **01** | **Repository Audit & Baseline** | Clean baseline build, document implemented vs proposed modules. | 58/58 unit tests passing, zero lint errors. |
| **02** | **4-Page Product Experience** | Implement Landing, Workspace, Model Studio, and Live Monitoring views. | All primary views render without errors. |
| **03** | **Deterministic Visualization Engine** | Implement `VisualizationSpec` and query execution engine without synthetic series. | Chart values match exact SQL/array aggregation results. |
| **04** | **Production AutoML & Leaderboard** | Train/Val/Test (70/15/15) isolation, candidate comparison, held-out evaluation. | Baselines, feature importance, and residuals calculated deterministically. |
| **05** | **Live Monitoring & Observability** | Ingestion freshness, detection delay in ms, statistical drift alerts. | Mean shift warnings trigger on $>25\%$ variance. |
| **06** | **FastAPI Control Plane (`apps/api`)** | REST & SSE endpoints for projects, datasets, query execution, model registry. | Automated pytest suite for all endpoints. |
| **07** | **DuckDB-Wasm Integration** | Client-side in-browser SQL execution for million-row queries. | In-memory SQL queries execute under 50ms. |
| **08** | **Autonomous Agent Tool Registry** | Typed tools: `profile_dataset`, `run_sql`, `train_model`, `render_chart`. | Bounded cognitive loop with proof citations. |
| **09** | **Enterprise Security & Dual Edition** | Differentiate Local-First Edition vs Enterprise Edition (OIDC/RBAC/S3). | PII masking and zero-exfiltration verified. |
| **10** | **Production Release & Deployment** | Docker Compose orchestration, CI/CD pipelines, and health checks. | Automated deployment to staging/production. |

---

## 5. Author & Attribution

- **Architect & Engineer:** **ANSH RAJORE**
- **Repository:** `github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git`
- **Copyright:** &copy; 2026 SVAJNA Inc. All rights reserved.
