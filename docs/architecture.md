# SVAJNA — Production Architecture & System Design

**Platform:** SVAJNA Autonomous Data Science Operating System  
**Lead Architect:** ANSH RAJORE  
**Date:** October 2026  

---

## 1. System Overview

SVAJNA is architected as an autonomous data science operating system that bridges local-first privacy with enterprise-scale analytics. It decouples the user experience and agent reasoning from deterministic computation engines.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SVAJNA CORE TOPOLOGY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [CLIENT TIER] (React + Vite + Web Workers)                                │
│   • 12-Stage Pipeline Navigator (Step-by-step inspectable progression)     │
│   • Recharts / SVG Spatial Visualization Engine                             │
│   • In-Memory Vectorized Math (OLS, Logit SGD, KNN, K-Means++, C4.5 Tree)   │
│   • Zero-exfiltration local sandbox                                         │
│                                                                             │
│                                      │ (REST / SSE / Local State)            │
│                                      ▼                                      │
│                                                                             │
│   [ANALYTICAL & AGENT ENGINE TIER] (@svajna/core & @svajna/web/autonomous)  │
│   • Data Quality Autopilot & Transformation Engine                          │
│   • Root-Cause Investigation Tree Decomposer                                │
│   • Empirical Hypothesis Testing Engine (Pearson, ANOVA, Chi-Square)        │
│   • AutoML Leaderboard (70/15/15 Split, Baseline vs Candidates)            │
│   • Cognitive Agent Loop (Perception -> Hypothesis -> Tool -> Critique)     │
│                                                                             │
│                                      │ (Append-Only SHA-256 Ledger)         │
│                                      ▼                                      │
│                                                                             │
│   [DURABILITY & GOVERNANCE TIER]                                            │
│   • Immutable Dataset Fingerprints & State Snapshots                        │
│   • Model Registry with Serialized Artifacts & Metrics                      │
│   • Bounded Autonomy Enforcement (Levels 0 – 4)                             │
│   • Cryptographic Audit Trail                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Responsibilities

| Component | Technology | Primary Responsibilities |
| :--- | :--- | :--- |
| **Web UI** | React 18, Vite, TypeScript | Delivers the 12-stage pipeline navigator, 12-col canvas, model leaderboard, and live monitoring. |
| **Visualizations** | Recharts, Custom SVG | Executes `VisualizationSpec` with typed aggregations, zero synthetic points. |
| **Data Plane** | `@svajna/core` connectors | Parses CSV, TSV, JSON; validates schemas; detects data types and nulls. |
| **Preprocessing** | `@svajna/core/transform` | Deterministic imputation, one-hot encoding, IQR outlier capping, scaling. |
| **AutoML Engine** | `automl-studio.ts` | 70/15/15 split isolation, baseline models, candidate fitting, held-out evaluation. |
| **Agent Runtime** | `autonomous-agent.ts` | Formulates plans, invokes deterministic tools, evaluates evidence, critiques outputs. |
| **Governance** | `@svajna/core/governance` | Enforces approval gates, autonomy levels (0-4), and immutable audit events. |
| **Observability** | `monitoring-engine.ts` | Measures data freshness (seconds), detection latency (ms), and statistical drift alerts. |

---

## 3. Data Flow Across the 12 Pipeline Stages

```text
[Raw Input File/Paste]
        │
        ▼ (Stage 1: Ingestion)
[Immutable Raw Dataset Snapshot] ──> (Stage 2: Exploratory Data Analysis)
                                             │
                                             ▼ (Stage 3: Quality & Validation)
[Audited Quality Scorecard] ───────> (Stage 4: Data Preprocessing)
                                             │
                                             ▼ (Stage 5: Feature Engineering)
[Engineered Dataset Snapshot] ─────> (Stage 6: Train / Val / Test Split 70/15/15)
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼ (Stage 7: Model Training)                     │
          [Train & Val Partitions]                                   │
                     │                                               │
                     ▼ (Stage 8: Model Evaluation)                   ▼
          [Champion Model Candidate] ───────> [Held-out Untouched Test Set]
                     │                                       │
                     └───────────────────────┬───────────────┘
                                             ▼ (Stage 9: Interactive Visualization)
                                  [Query-Driven Visuals]
                                             │
                                             ▼ (Stage 10: Explainability & Insights)
                                  [Attributed Evidence Tree]
                                             │
                                             ▼ (Stage 11: Prediction & What-If)
                                  [Interactive Inference Engine]
                                             │
                                             ▼ (Stage 12: Final Report & Export)
                                  [Reproducible Report (.md / .html)]
```

---

## 4. Trust Boundaries & Security Model

1. **Client Memory Boundary:** Data loaded into the local browser session remains in client memory. No telemetry or dataset values are sent to external third parties.
2. **Untrusted Data Isolation:** All user-uploaded files, column names, and cell values are treated as untrusted inputs and sanitized against script execution or prompt injection.
3. **Audit Immutability:** Every stage transition, transformation parameter, and model checkpoint produces an SHA-256 fingerprint recorded in the audit trail.
4. **Governed Approvals:** Downstream operations that modify business systems or trigger retrain workflows require explicit user confirmation.
