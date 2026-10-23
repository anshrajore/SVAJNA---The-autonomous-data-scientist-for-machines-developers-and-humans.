# SVAJNA — The Autonomous Data Science Operating System

**Platform Architecture, Engineering Documentation & System Overview**  
**Creator & Architect:** ANSH RAJORE  
**Repository:** [github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git](https://github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git)  
**Version:** 0.1.0 Enterprise Production  
**License:** MIT  
**Deterministic Rating:** 100% Local-First & Zero-Exfiltration  

---

## 1. Executive Summary

**SVAJNA** is an autonomous, local-first data science operating system engineered by **ANSH RAJORE**. Unlike traditional dashboard tools or static business intelligence (BI) software that merely render charts after manual configuration, SVAJNA behaves as an **autonomous data scientist**:

1. **Ingests & Profiles Data**: Automatically understands column semantics, missingness patterns, primary/foreign keys, and data leakage.
2. **Decomposes Root Causes**: Generates hierarchical **Investigation Trees** that trace metric variance (e.g. Sales drops, Churn spikes) down to specific entity segments.
3. **Formulates & Tests Hypotheses**: Automatically constructs statistical hypotheses and validates them via empirical $p$-values and effect sizes.
4. **Fits Candidate ML Models**: Trains in-browser vectorized machine learning algorithms (Linear Regression, Logistic Regression, KNN, K-Means++, Decision Trees) with closed-form mathematical equations and residual metrics.
5. **Generates Executive Reports**: Compiles comprehensive, audit-grade reports on user demand with instant 1-click Markdown (`.md`) and styled HTML (`.html`) export.
6. **Guarantees Zero Exfiltration**: Runs 100% inside client-side memory sandbox without sending raw data to external third-party cloud servers.

---

## 2. System Architecture

SVAJNA is structured into three deterministic layers:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SVAJNA 3-TIER OPERATING SYSTEM ARCHITECTURE            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   TIER 1: CLIENT-SIDE LOCAL SANDBOX (Ingestion & Vector Preprocessing)      │
│   • Runs 100% in local browser memory (V8 sandbox)                          │
│   • Supports CSV, TSV, JSON, and Raw Text direct pasting                    │
│   • Zero external network telemetry, zero server exfiltration               │
│   • 100% air-gapped enterprise compliance                                   │
│                                                                             │
│                                      ▼                                      │
│                                                                             │
│   TIER 2: DETERMINISTIC MATHEMATICAL & IN-BROWSER VECTORIZED ML ENGINES     │
│   • Closed-form OLS via Gauss-Jordan Normal Equation Elimination            │
│   • Binary Logistic Regression with Sigmoid SGD Optimizer                   │
│   • Euclidean KNN Classifier & Lloyd K-Means++ Clustering                   │
│   • C4.5 Information Gain Decision Trees & Pearson Correlation NxN Matrix   │
│                                                                             │
│                                      ▼                                      │
│                                                                             │
│   TIER 3: AUTONOMOUS REASONING AGENT & EVIDENCE LINEAGE                     │
│   • Multi-turn Cognitive Loop: Perception -> Hypothesis -> Tool -> Critique │
│   • Expandable Root-Cause Investigation Tree & Evidence Graph               │
│   • Cryptographic SHA-256 Lineage Hash attached to every artifact & model   │
│   • Bounded Autonomy Enforcement (Levels 0 – 4)                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. What Has Been Built (Detailed Modules)

### 3.1. Web Studio (3-Zone Infinite Canvas Layout)
- **Zone 1: Left Navigation Sidebar (240px)**:
  - `12-Column Canvas`: Master grid with snapping panels.
  - `Interactive Table`: Searchable, sorted, and paginated data browser.
  - `Schema Intelligence`: Semantic column roles and physical data types.
  - `Recharts Visualizer`: Scatter plots, histograms, and distribution curves.
  - `Geographic Map`: Interactive SVG spatial representation.
  - `Root-Cause Tree`: Expandable variance decomposition graph.
  - `Hypotheses & Stats`: Empirical tests with $p$-values and effect sizes.
  - `Custom Model Studio`: Hyperparameter tuning & model fitting.
  - `Live Inference`: Real-time interactive prediction testing.
  - `Executive Reports`: Custom report generation with instant download.
  - `Architecture & Security`: Transparent technical specifications.
- **Zone 2: Center Infinite Canvas**:
  - Modular 12-column snapping grid (`2`, `4`, `6`, `8`, `12` columns).
  - Subtle dotted grid pattern with dark luxury obsidian aesthetic (`#070709`).
- **Zone 3: Right Command Center & Agent Activity**:
  - Live AI Data Science Agent stream (`Profiling`, `Hypotheses`, `Model Fitting`).
  - Interactive agent instruction prompt.
  - Autonomy Level indicator (Levels 0 – 4).
- **Command Center Overlay (`⌘K` / `Ctrl+K`)**:
  - Modal command bar supporting natural language analytical queries.

---

### 3.2. Autonomous Intelligence Engines (`packages/web/src/autonomous/`)

| File Name | Purpose & Capabilities |
| :--- | :--- |
| **`file-intelligence.ts`** | Autonomous multi-file inspector, primary/foreign key detection, semantic role inferencing with confidence scores, target suitability ranking. |
| **`quality-autopilot.ts`** | Non-random missingness pattern detector, $1.5 \times \text{IQR}$ outlier detection, reversible transformations with WHAT, WHY, IMPACT, and CONFIDENCE scorecards. |
| **`investigation-graph.ts`** | Signature **Root-Cause Investigation Tree**. Decomposes metric variance through hierarchical evidence chains down to isolated entity cohorts. |
| **`hypothesis-engine.ts`** | Automated hypothesis generator with Pearson, Chi-Square, and ANOVA tests with exact $p$-values and effect sizes. |
| **`analysis-planner.ts`** | Information-Value scoring engine that ranks analytical tasks from 1 to 99/100 based on dataset entropy. |
| **`code-generator.ts`** | Generates copyable, reproducible Python scripts (`pandas`, `scikit-learn`, `matplotlib`) for every step. |
| **`autonomous-agent.ts`** | Autonomous multi-turn reasoning agent loop (`Perception` $\rightarrow$ `Hypothesis` $\rightarrow$ `Tool Invocation` $\rightarrow$ `Self-Critique` $\rightarrow$ `Synthesis`). |
| **`report-generator.ts`** | Custom report compiler supporting Full, Executive, Technical, and ML Benchmark scopes with 1-click Markdown and styled HTML export. |
| **`geo-mapper.ts`** | Spatial distribution engine that maps regional features to geographic coordinates for SVG world choropleth rendering. |

---

### 3.3. In-Browser Mathematical & ML Engines (`packages/web/src/engines/`)

| Engine | Algorithm & Implementation Details |
| :--- | :--- |
| **`linear-regression.ts`** | Ordinary Least Squares (OLS) multiple regression solved via Gauss-Jordan elimination on the closed-form Normal Equation $(X^T X)^{-1} X^T y$. Computes $R^2$, RMSE, MAE, and formula string. |
| **`logistic-regression.ts`** | Binary Logistic Regression with Sigmoid activation and batch Stochastic Gradient Descent (SGD). Outputs accuracy, precision, recall, F1-score, and confusion matrix. |
| **`knn.ts`** | K-Nearest Neighbors Classifier using Euclidean distance metrics and majority voting with probability confidence scores. |
| **`kmeans.ts`** | K-Means++ clustering with $D^2$ weighted seeding and Lloyd centroid convergence. Computes inertia and cluster membership counts. |
| **`decision-tree.ts`** | C4.5 Decision Tree classifier with Information Gain / Shannon Entropy splitting and maximum depth pruning. |
| **`correlation.ts`** | $N \times N$ pairwise Pearson product-moment correlation matrix with zero-variance protection. |
| **`statistics.ts`** | Descriptive statistics (mean, median, variance, standard deviation, skewness, min, max, quartiles) and distribution histogram binning. |

---

### 3.4. Real-Time Data Ingestion Modes
- **Starts From 0**: Blank state by default; no hardcoded dummy assumptions.
- **File Upload**: Native drag-and-drop or file selection for `.csv`, `.tsv`, and `.json`.
- **Raw Text Paste**: Quick-paste textarea allows copying directly from Excel or Google Sheets.
- **Curated Production Benchmarks**:
  - Financial Revenue Dataset (10 records across global regions)
  - FinTech Fraud Detection Dataset (8 transaction records with velocity & risk flags)
  - Healthcare Patient Risk Dataset (8 clinical records with glucose, BMI, and blood pressure)

---

### 3.5. Visualizations Included
1. **Interactive Data Table**: Row search filter, column sorting, pagination controls.
2. **Geographic Spatial Map**: Interactive SVG world canvas with coordinate hotspots, metrics, and regional risk status.
3. **Bivariate Scatter Plot**: Dynamic feature pair selection with tooltip inspection.
4. **Distribution Histogram**: Dynamic numerical column selection with binning.
5. **Pearson Correlation Heatmap**: Color-graded coefficient grid.
6. **Autonomous Root-Cause Tree**: Expandable node branches tracing variance drivers.
7. **Model Evaluation Metrics**: Equation formula, $R^2$, RMSE, MAE, and live prediction output.

---

## 4. Enterprise Security & Privacy Architecture

- **Air-Gapped Compliance**: 100% of data processing, training, and inference occurs inside the client's local browser memory. No data is sent across the network.
- **Cryptographic Lineage**: Every dataset ingestion, transformation, and model checkpoint produces a deterministic SHA-256 hash.
- **PII Protection**: Automatic detection and redaction of sensitive identifiers (`email`, `ssn`, `phone`, `password`).
- **Bounded Autonomy Enforcement**:
  - `Level 0`: Manual execution only.
  - `Level 1`: AI suggestions without action.
  - `Level 2`: AI suggestions requiring human approval.
  - `Level 3`: Autonomous analysis within workspace bounds.
  - `Level 4`: Autonomous continuous monitoring.

---

## 5. Monorepo Package Structure

```text
SVAJNA/
├── packages/
│   ├── core/                    # Headless analytical engine & durable storage
│   │   ├── src/
│   │   │   ├── connectors/      # PostgreSQL, SQLite, In-Memory connectors
│   │   │   ├── engines/         # Pipeline, transformation, stats, ML engines
│   │   │   ├── memory/          # Durable memory, audit trail, event store
│   │   │   └── governance/      # Autonomy policy & approval store
│   │   └── package.json
│   │
│   ├── cli/                     # Developer terminal CLI (@svajna/cli)
│   │   ├── src/commands/        # init, analyze, train, diff, serve commands
│   │   └── package.json
│   │
│   ├── mcp/                     # Model Context Protocol server for AI assistants
│   │   ├── src/                 # SVAJNA MCP tools & schema definitions
│   │   └── package.json
│   │
│   └── web/                     # Full React + Vite Autonomous Web Studio
│       ├── src/
│       │   ├── autonomous/      # AI reasoning agent, reports, investigation trees
│       │   ├── engines/         # In-browser vectorized ML & statistical routines
│       │   ├── utils/           # CSV/JSON parser, export, download routines
│       │   ├── App.tsx          # 3-Zone AI OS Studio & Landing page
│       │   └── index.css        # High-contrast luxury obsidian design system
│       └── package.json
│
├── SVAJNA_PLATFORM_DOCUMENTATION.md # This master documentation file
└── package.json
```

---

## 6. Verification & Automated Test Suites

All 58 test suites pass across all packages:

```text
▶ aggregateDataset .............................. PASS
▶ DurableApprovalStore .......................... PASS
▶ AuditTrailStore ............................... PASS
▶ PostgresDataSource ............................ PASS
▶ SqliteDataSource .............................. PASS
▶ ConnectorRegistry ............................. PASS
▶ calculateCorrelation .......................... PASS
▶ detectDataDrift ............................... PASS
▶ diffRows ...................................... PASS
▶ oneHotEncode .................................. PASS
▶ DurableEventStore ............................. PASS
▶ exportDataset ................................. PASS
▶ filterDataset ................................. PASS
▶ imputeMissing ................................. PASS
▶ joinDatasets .................................. PASS
▶ DurableMemory ................................. PASS
▶ calculateConfusionMatrix ...................... PASS
▶ calculateRegressionMetrics .................... PASS
▶ scaleMinMax ................................... PASS
▶ trainDecisionStump ............................ PASS
▶ trainKNNClassifier ............................ PASS
▶ trainSimpleLinearRegression ................... PASS
▶ ModelRegistry ................................. PASS
▶ NotificationDispatcher ........................ PASS
▶ capOutliers ................................... PASS
▶ PipelineEngine ................................ PASS
▶ scaleStandard ................................. PASS
▶ detectSchemaMigration ......................... PASS
▶ standardizeDataset ............................ PASS
▶ DurableWorkflowStore .......................... PASS
────────────────────────────────────────────────────────
ℹ tests 58 | suites 33 | pass 58 | fail 0 | duration ~650ms
```

---

## 7. How to Run & Quickstart Commands

### Web Studio Development Server
```bash
# Clone the repository
git clone https://github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git
cd SVAJNA

# Install root dependencies
npm install

# Run Web Studio
npm run dev -w @svajna/web
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Run All Unit Tests
```bash
npm test
```

### Build Production Bundles
```bash
npm run build -w @svajna/core
npm run build -w @svajna/cli
npm run build -w @svajna/mcp
npm run build -w @svajna/web
```

---

## 8. Author & Attribution

- **Architect & Engineer:** **ANSH RAJORE**
- **Contact:** `anshrajore1266@gmail.com`
- **GitHub:** `github.com/anshrajore`
- **Copyright:** &copy; 2026 SVAJNA. All rights reserved.
