import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  parseBrowserCsv,
  inferColumnTypes,
  getNumericColumns,
  getCategoricalColumns,
  exportAsCsv,
  exportAsJson,
  downloadFile,
  diffRows,
} from "./utils/browser-analysis";

import { computeColumnStats, computeHistogram } from "./engines/statistics";
import { correlationMatrix } from "./engines/correlation";
import { trainLinearRegression, LinearRegressionResult } from "./engines/linear-regression";
import { trainLogisticRegression, LogisticRegressionResult } from "./engines/logistic-regression";
import { trainKNN, KNNResult } from "./engines/knn";
import { trainKMeans, KMeansResult } from "./engines/kmeans";
import { trainDecisionTree, DecisionTreeResult } from "./engines/decision-tree";

const PRELOADED_SALES_DATA = [
  { id: 1, country: "USA", sales: 125000, profit: 34000, active: true, region: "North America", score: 88 },
  { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true, region: "Asia Pacific", score: 92 },
  { id: 3, country: "Germany", sales: 87000, profit: 21000, active: true, region: "Europe", score: 85 },
  { id: 4, country: "UK", sales: 65000, profit: 16000, active: false, region: "Europe", score: 79 },
  { id: 5, country: "India", sales: 142000, profit: 41000, active: true, region: "Asia Pacific", score: 95 },
  { id: 6, country: "Canada", sales: 54000, profit: 13000, active: true, region: "North America", score: 81 },
  { id: 7, country: "Australia", sales: 76000, profit: 19500, active: true, region: "Asia Pacific", score: 84 },
  { id: 8, country: "France", sales: 91000, profit: 23000, active: true, region: "Europe", score: 89 },
  { id: 9, country: "Brazil", sales: 62000, profit: 14000, active: false, region: "South America", score: 75 },
  { id: 10, country: "Singapore", sales: 115000, profit: 31000, active: true, region: "Asia Pacific", score: 94 },
];

export const App: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<number>(2);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"profiler" | "visualizer" | "ml" | "predictions" | "diff" | "export">("profiler");
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // User dataset state
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>(PRELOADED_SALES_DATA);
  const [fileName, setFileName] = useState<string>("sales_q3.csv");

  // Charting selection state
  const [scatterX, setScatterX] = useState<string>("sales");
  const [scatterY, setScatterY] = useState<string>("profit");
  const [histCol, setHistCol] = useState<string>("sales");
  const [barCol, setBarCol] = useState<string>("region");

  // ML Lab Selection state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"linear" | "logistic" | "knn" | "kmeans" | "decisionTree">("linear");
  const [selectedTarget, setSelectedTarget] = useState<string>("profit");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["sales", "score"]);
  const [paramK, setParamK] = useState<number>(3);
  const [paramEpochs, setParamEpochs] = useState<number>(300);

  // Trained ML models state
  const [trainedLinearModel, setTrainedLinearModel] = useState<LinearRegressionResult | null>(null);
  const [trainedLogisticModel, setTrainedLogisticModel] = useState<LogisticRegressionResult | null>(null);
  const [trainedKNNModel, setTrainedKNNModel] = useState<KNNResult | null>(null);
  const [trainedKMeansModel, setTrainedKMeansModel] = useState<KMeansResult | null>(null);
  const [trainedTreeModel, setTrainedTreeModel] = useState<DecisionTreeResult | null>(null);

  // Prediction input form state
  const [predictionInputs, setPredictionInputs] = useState<Record<string, number>>({ sales: 150000, score: 90 });
  const [predictionOutput, setPredictionOutput] = useState<string | number | null>(null);

  // Derived column types
  const numericCols = useMemo(() => getNumericColumns(datasetRows), [datasetRows]);
  const categoricalCols = useMemo(() => getCategoricalColumns(datasetRows), [datasetRows]);
  const columnTypes = useMemo(() => inferColumnTypes(datasetRows), [datasetRows]);

  // Dynamic Correlation Matrix
  const corrData = useMemo(() => correlationMatrix(datasetRows, numericCols), [datasetRows, numericCols]);

  // Diff comparison demo
  const sampleTeamV2 = [
    { id: 1, country: "USA", sales: 145000, profit: 42000, active: true, region: "North America", score: 91 },
    { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true, region: "Asia Pacific", score: 92 },
    { id: 11, country: "South Korea", sales: 88000, profit: 22000, active: true, region: "Asia Pacific", score: 86 },
  ];
  const diffResult = useMemo(() => diffRows(datasetRows, sampleTeamV2, "id"), [datasetRows]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDatasetRows(parsed);
          }
        } catch {
          alert("Invalid JSON array file.");
        }
      } else {
        const rows = parseBrowserCsv(content);
        if (rows.length) {
          setDatasetRows(rows);
        } else {
          alert("Unable to parse CSV data.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTrainModel = () => {
    if (!datasetRows.length) return;
    try {
      if (selectedAlgorithm === "linear") {
        const res = trainLinearRegression(datasetRows, selectedFeatures, selectedTarget);
        setTrainedLinearModel(res.train);
      } else if (selectedAlgorithm === "logistic") {
        const res = trainLogisticRegression(datasetRows, selectedFeatures, selectedTarget, { epochs: paramEpochs });
        setTrainedLogisticModel(res);
      } else if (selectedAlgorithm === "knn") {
        const res = trainKNN(datasetRows, selectedFeatures, selectedTarget, paramK);
        setTrainedKNNModel(res);
      } else if (selectedAlgorithm === "kmeans") {
        const res = trainKMeans(datasetRows, selectedFeatures, paramK);
        setTrainedKMeansModel(res);
      } else if (selectedAlgorithm === "decisionTree") {
        const res = trainDecisionTree(datasetRows, selectedFeatures, selectedTarget);
        setTrainedTreeModel(res);
      }
    } catch (err: any) {
      alert("Training error: " + (err?.message || "Check selected features and target."));
    }
  };

  const handlePredict = () => {
    if (selectedAlgorithm === "linear" && trainedLinearModel) {
      let val = trainedLinearModel.intercept;
      trainedLinearModel.featureNames.forEach((feat, idx) => {
        val += (predictionInputs[feat] ?? 0) * (trainedLinearModel.coefficients[idx] ?? 0);
      });
      setPredictionOutput(Math.round(val * 100) / 100);
    } else if (selectedAlgorithm === "logistic" && trainedLogisticModel) {
      const inputArr = trainedLogisticModel.featureNames.map((f) => predictionInputs[f] ?? 0);
      const pred = trainedLogisticModel.predict(inputArr);
      setPredictionOutput(`${pred.label} (Prob: ${(pred.probability * 100).toFixed(1)}%)`);
    } else if (selectedAlgorithm === "knn" && trainedKNNModel) {
      const inputArr = trainedKNNModel.featureNames.map((f) => predictionInputs[f] ?? 0);
      const pred = trainedKNNModel.predict(inputArr);
      setPredictionOutput(`${pred.label} (Conf: ${(pred.confidence * 100).toFixed(1)}%)`);
    } else if (selectedAlgorithm === "kmeans" && trainedKMeansModel) {
      const inputArr = trainedKMeansModel.featureNames.map((f) => predictionInputs[f] ?? 0);
      const cluster = trainedKMeansModel.predict(inputArr);
      setPredictionOutput(`Cluster ${cluster}`);
    } else if (selectedAlgorithm === "decisionTree" && trainedTreeModel) {
      const pred = trainedTreeModel.predict(predictionInputs);
      setPredictionOutput(String(pred));
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length > 1) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const osCommands = {
    mac: `# Install SVAJNA CLI globally on macOS\nnpm install -g @svajna/cli\n\n# Initialize local workspace state\nsvajna init\n\n# Run deterministic dataset profiling\nsvajna analyze ./data.csv\n\n# Execute automated multi-step pipeline\nsvajna pipeline ./data.csv`,
    linux: `# Install SVAJNA on Linux (Debian / Ubuntu / Arch)\ncurl -fsSL https://svajna.ai/install.sh | bash\n\n# Initialize project audit directory\nsvajna init\n\n# Verify data drift between versions\nsvajna drift baseline.json current.json revenue`,
    win: `# Windows PowerShell Installation\nnpm install -g @svajna/cli\n\n# Initialize local storage under .svajna/\nsvajna init\n\n# Run full verification suite\nsvajna analyze .\\dataset.csv`,
    docker: `# Run SVAJNA within isolated Docker Container\ndocker run -it --rm -v $(pwd):/workspace svajna/core:latest \\\n  svajna analyze /workspace/data.csv`,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Pie chart palette
  const COLORS = ["#ff4d00", "#38bdf8", "#4ade80", "#fbbf24", "#a855f7", "#ec4899"];

  return (
    <div>
      {/* 1. TOP HEADER NAVIGATION */}
      <div className="section-dark" style={{ padding: "0 0 16px 0" }}>
        <div className="site-container">
          <header className="navbar">
            <a href="#" className="brand-logo-container">
              <div className="brand-svg-logo">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="brand-title-wrap">
                <span className="brand-title">svajna</span>
                <span className="brand-creator-tag">By ANSH RAJORE</span>
              </div>
            </a>

            <ul className="nav-links">
              <li><a href="#platform" className="nav-link">Platform</a></li>
              <li><a href="#commands" className="nav-link">Commands & OS</a></li>
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#security" className="nav-link">Security & Policy</a></li>
            </ul>

            <button className="nav-cta-btn" onClick={() => setIsConsoleOpen(true)}>
              Launch Web Studio ↗
            </button>
          </header>
        </div>
      </div>

      {/* 2. HERO SECTION (PITCH BLACK) */}
      <section className="section-dark" id="platform" style={{ paddingTop: "20px" }}>
        <div className="site-container">
          <div className="hero-wrapper">
            <div className="hero-spark-container">
              <span className="hero-spark">✦</span>
              <span className="hero-spark small">✦</span>
            </div>

            <div>
              <div className="hero-creator-pill">
                ✦ Built by ANSH RAJORE • Autonomous OS
              </div>

              <h1 className="hero-headline">
                SECURE YOUR
                <br />
                DATA FUTURE
              </h1>

              <p className="hero-subtext">
                The most advanced local-first autonomous data scientist with verifiable execution, bounded autonomy, and mathematical evidence.
              </p>

              <div className="hero-actions">
                <button className="btn-orange-pill" onClick={() => setIsConsoleOpen(true)}>
                  Explore Platform
                </button>
                <button className="btn-circle-arrow" onClick={() => setIsConsoleOpen(true)}>
                  ↗
                </button>
              </div>

              <div className="hero-user-badge">
                <div className="user-status-dot"></div>
                <div className="user-count-text">58 Test Suites • 100% Deterministic</div>
              </div>
            </div>

            {/* 3D Smart Cards Hero Visual */}
            <div className="hero-visual-container">
              <div className="card-3d-stack">
                <div className="smart-card orange-top">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="card-brand-name">svajna</span>
                    <div className="card-chip"></div>
                  </div>
                  <div>
                    <div className="card-number">•••• •••• •••• 9842</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      <span className="card-holder">ANSH RAJORE</span>
                      <span style={{ fontSize: "11px", opacity: 0.9 }}>VERIFIED ARCHITECT</span>
                    </div>
                  </div>
                </div>

                <div className="smart-card silver-middle">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700 }}>DETERMINISTIC ML</span>
                    <span>⚡</span>
                  </div>
                  <div className="card-number">•••• •••• •••• 7710</div>
                </div>

                <div className="smart-card black-bottom">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", opacity: 0.6 }}>IMMUTABLE AUDIT PROOF</span>
                  <div className="card-number">•••• •••• •••• 2026</div>
                </div>
              </div>

              <div className="hero-step-guide">
                <div className="step-guide-item">
                  <span className="step-guide-text">Upload CSV Dataset</span>
                  <span className="step-guide-num">01</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Recharts Visualizer</span>
                  <span className="step-guide-num">02</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Train Real ML Models</span>
                  <span className="step-guide-num">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: COMMAND HUB & OS CODE SWITCHER */}
      <section className="section-dark" id="commands" style={{ paddingTop: "0px", paddingBottom: "80px" }}>
        <div className="site-container">
          <div className="section-tag dark-theme">// QUICKSTART COMMAND HUB</div>
          <div className="section-header-split">
            <h2 className="section-title white-text">
              ONE-CLICK INSTALL
              <br />
              ACROSS EVERY OS
            </h2>
            <p className="section-lead-desc white-theme">
              Run SVAJNA directly on macOS, Linux, Windows, or Docker. No cloud lock-in, zero external telemetry, 100% local execution.
            </p>
          </div>

          <div className="os-terminal-wrapper">
            <div className="os-tab-bar">
              <button
                className={`os-tab-btn ${osTab === "mac" ? "active" : ""}`}
                onClick={() => setOsTab("mac")}
              >
                macOS (Homebrew / npm)
              </button>
              <button
                className={`os-tab-btn ${osTab === "linux" ? "active" : ""}`}
                onClick={() => setOsTab("linux")}
              >
                Linux (Bash)
              </button>
              <button
                className={`os-tab-btn ${osTab === "win" ? "active" : ""}`}
                onClick={() => setOsTab("win")}
              >
                Windows (PowerShell)
              </button>
              <button
                className={`os-tab-btn ${osTab === "docker" ? "active" : ""}`}
                onClick={() => setOsTab("docker")}
              >
                Docker Sandbox
              </button>
            </div>

            <div className="os-code-content">
              <button
                className="copy-btn-floating"
                onClick={() => copyToClipboard(osCommands[osTab])}
              >
                {copiedCode ? "✓ Copied!" : "📋 Copy Code"}
              </button>
              <pre style={{ margin: 0, fontFamily: "inherit" }}>
                <code>{osCommands[osTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: GETTING TO KNOW SVAJNA (LIGHT SLATE) */}
      <section className="section-light" id="about">
        <div className="site-container">
          <div className="section-tag light-theme">// ABOUT THE OPERATING SYSTEM</div>
          <div className="section-header-split">
            <h2 className="section-title dark-text">
              GETTING TO
              <br />
              KNOW SVAJNA
            </h2>
            <p className="section-lead-desc">
              Engineered from the ground up by ANSH RAJORE. SVAJNA replaces brittle notebook scripts with verifiable, mathematically backed execution graphs.
            </p>
          </div>

          <div className="bento-stats-grid">
            <div className="bento-stat-card orange">
              <div className="stat-icon-badge black-bg">↓</div>
              <div>
                <div className="bento-stat-val">
                  8 <span>ML Engines</span>
                </div>
                <p className="bento-stat-desc">
                  Built-in linear, logistic, KNN, K-Means, Decision Tree, statistics, and correlation algorithms running directly in browser memory.
                </p>
              </div>
            </div>

            <div className="bento-stat-card black">
              <div className="stat-icon-badge orange-bg">✓</div>
              <div>
                <div className="bento-stat-val">
                  100<span>%</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#a1a1aa" }}>
                  Deterministic execution rating with SHA-256 audit verification and zero-exfiltration privacy bounds.
                </p>
              </div>
            </div>

            <div className="bento-stat-card white">
              <div className="stat-icon-badge orange-bg">★</div>
              <div>
                <div className="bento-stat-val">
                  58<span>/58</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#71717a" }}>
                  Passing automated unit test suites covering CLI, MCP protocol, and Core dataset transformation engines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: FEATURES & INTERACTIVE RUN PROFILE */}
      <section className="section-light" id="features" style={{ paddingTop: "0" }}>
        <div className="site-container">
          <div className="section-tag light-theme">// CORE CAPABILITIES</div>
          <div className="section-header-split">
            <h2 className="section-title dark-text">
              ALL-IN-ONE PLATFORM
              <br />
              FOR DATA SCIENCE
            </h2>
            <p className="section-lead-desc">
              All your data sources, SQL engines, ML algorithms, and cryptographic audit records are organized in real time.
            </p>
          </div>

          <div className="features-split-layout">
            <div className="accordion-list">
              {[
                { id: 0, num: "01", title: "Secure and Easy Ingestion" },
                { id: 1, num: "02", title: "Real-Time Drift & Anomaly Monitoring" },
                { id: 2, num: "03", title: "Fast & Easy ML Pipelines" },
                { id: 3, num: "04", title: "Verifiable Memory & Cryptographic Lineage" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={`accordion-item ${activeAccordion === item.id ? "active" : ""}`}
                  onClick={() => setActiveAccordion(item.id)}
                >
                  <div className="accordion-left">
                    <span className="accordion-num">{item.num}</span>
                    <span className="accordion-title">{item.title}</span>
                  </div>
                  <div className="accordion-icon">
                    {activeAccordion === item.id ? "↗" : ">"}
                  </div>
                </div>
              ))}
            </div>

            <div className="mockup-display-card">
              <div className="mockup-header-dots">
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
              </div>

              <div className="mockup-title">Latest Execution Run: run_20260902_svajna</div>

              <div className="progress-bar-container">
                <div className="progress-segment orange" title="48% Profiling"></div>
                <div className="progress-segment black" title="28% Model Fitting"></div>
                <div className="progress-segment gray" title="24% Validation"></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#71717a", marginBottom: "20px" }}>
                <span>• 48% Ingestion & Profiling</span>
                <span>• 28% Model Fitting</span>
                <span>• 24% Quality Audit</span>
              </div>

              <div className="mockup-row-item">
                <div className="mockup-user-info">
                  <div className="mockup-user-avatar">AR</div>
                  <div>
                    <div className="mockup-user-name">ANSH RAJORE (Lead Architect)</div>
                    <div className="mockup-user-date">{fileName} • {datasetRows.length} rows loaded</div>
                  </div>
                </div>
                <span className="mockup-badge orange">Active Dataset</span>
              </div>

              <div className="mockup-row-item">
                <div className="mockup-user-info">
                  <div className="mockup-user-avatar">ML</div>
                  <div>
                    <div className="mockup-user-name">Autonomous ML Engine</div>
                    <div className="mockup-user-date">OLS Linear & Logistic Regression</div>
                  </div>
                </div>
                <span className="mockup-badge orange">Ready</span>
              </div>

              <div className="mockup-row-item" style={{ borderBottom: "none" }}>
                <div className="mockup-user-info">
                  <div className="mockup-user-avatar">DT</div>
                  <div>
                    <div className="mockup-user-name">Statistical Drift Detector</div>
                    <div className="mockup-user-date">Pearson Correlation Matrix</div>
                  </div>
                </div>
                <span className="mockup-badge dark">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: ENTERPRISE SECURITY & MODEL PROTECTION POLICIES (PITCH BLACK) */}
      <section className="section-dark" id="security">
        <div className="site-container">
          <div className="hero-creator-pill">
            ✦ PROPRIETARY SAFETY PROTOCOLS
          </div>

          <div className="section-header-split">
            <h2 className="section-title white-text">
              MODEL SECURITY &
              <br />
              PROTECTION POLICIES
            </h2>
            <p className="section-lead-desc white-theme">
              SVAJNA prevents hallucinations and data exfiltration by anchoring all analytical intelligence inside a strictly bounded security sandbox.
            </p>
          </div>

          <div className="security-grid">
            <div className="security-card">
              <div className="security-icon">🛡️</div>
              <h3 className="security-title">Zero-Exfiltration Local Sandbox</h3>
              <p className="security-desc">
                Your raw datasets never leave your machine or private VPC. All file profiling, transformations, and model training occur purely in local memory.
              </p>
            </div>

            <div className="security-card">
              <div className="security-icon">🔒</div>
              <h3 className="security-title">SHA-256 Cryptographic Lineage</h3>
              <p className="security-desc">
                Every calculation, model metric, and decision generates a deterministic SHA-256 hash stored in an append-only verifiable audit trail.
              </p>
            </div>

            <div className="security-card">
              <div className="security-icon">⚡</div>
              <h3 className="security-title">Bounded Autonomy & Approval Gates</h3>
              <p className="security-desc">
                Enforces strict 0–6 autonomy levels. High-impact operations (database writes, schema migrations) require cryptographic human-in-the-loop approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: MULTI-SOURCE CONNECTORS & 3D DUAL CARDS */}
      <section className="section-light">
        <div className="site-container">
          <div className="dual-card-showcase-grid">
            <div className="dual-cards-graphic">
              <div className="showcase-vertical-card back-black">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>SVAJNA</span>
                  <div className="card-chip" style={{ width: "24px", height: "18px" }}></div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", opacity: 0.6 }}>AUDIT LINEAGE</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>•••• 5521</div>
                </div>
              </div>

              <div className="showcase-vertical-card front-orange">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px" }}>svajna</span>
                  <div className="card-chip" style={{ width: "26px", height: "20px" }}></div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700 }}>ANSH RAJORE</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", opacity: 0.9 }}>•••• 9842</div>
                </div>
              </div>
            </div>

            <div>
              <div className="section-tag light-theme">// CONNECTOR ECOSYSTEM</div>
              <h2 className="section-title dark-text" style={{ fontSize: "38px" }}>
                MULTI-SOURCE DATA
                <br />
                CONNECTORS & DRIFT
              </h2>

              <div className="benefit-bullet-list">
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Zero-friction database connector</strong> supporting PostgreSQL, SQLite, Snowflake, CSV, and streaming JSON formats.
                  </p>
                </div>
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Automated schema migration detection</strong> that flags breaking column deletions and field type mismatches.
                  </p>
                </div>
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Immutable cryptographic audit trail</strong> connecting every model conclusion to verifiable mathematical evidence.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button className="btn-orange-pill" onClick={() => setIsConsoleOpen(true)}>
                  Open Web Studio
                </button>
                <button className="btn-circle-arrow" onClick={() => setIsConsoleOpen(true)}>
                  ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: TESTIMONIAL & CREATOR SHOWCASE */}
      <section className="section-light" style={{ paddingTop: "0" }}>
        <div className="site-container">
          <div className="testimonial-card-wrapper">
            <span className="testimonial-quote-icon">”</span>
            <p className="testimonial-text">
              “SVAJNA eliminates the gap between experimental notebooks and verifiable production pipelines. An extraordinary achievement in autonomous data systems.”
            </p>

            <div className="testimonial-author-row">
              <div className="author-profile">
                <div className="author-badge-circle">AR</div>
                <div>
                  <div className="author-name">ANSH RAJORE</div>
                  <div className="author-role">Creator & Chief Architect, SVAJNA Operating System</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. GIANT 3D EMBOSSED WORDMARK */}
      <div className="giant-3d-wordmark-container">
        <div className="giant-3d-wordmark">svajna</div>
      </div>

      {/* 10. VIBRANT ORANGE FOOTER */}
      <footer className="vibrant-orange-footer">
        <div className="site-container">
          <div className="footer-top-grid">
            <div>
              <h3 className="footer-cta-headline">
                READY TO TAKE
                <br />
                CONTROL OF YOUR
                <br />
                DATA FUTURE
              </h3>
              <button className="btn-white-pill" onClick={() => setIsConsoleOpen(true)}>
                LAUNCH STUDIO
              </button>
            </div>

            <div>
              <div className="footer-col-title">Features</div>
              <ul className="footer-col-links">
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>Profiling Engine</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>Recharts Visualizer</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>ML Lab Studio</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>Live Inference</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Security</div>
              <ul className="footer-col-links">
                <li><a href="#">Local Sandbox</a></li>
                <li><a href="#">Audit Hashes</a></li>
                <li><a href="#">Bounded Autonomy</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Resources</div>
              <ul className="footer-col-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">MCP Protocol</a></li>
                <li><a href="#">GitHub Repo</a></li>
                <li><a href="#">Releases</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Engineering</div>
              <ul className="footer-col-links">
                <li><a href="#">By ANSH RAJORE</a></li>
                <li><a href="#">Node.js 20+</a></li>
                <li><a href="#">TypeScript 5.7</a></li>
                <li><a href="#">React 18 + Recharts</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>Built & Engineered by <strong>ANSH RAJORE</strong>. © 2026 SVAJNA Inc. All Rights Reserved.</div>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Terms of Service</a>
              <a href="#" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 11. INTERACTIVE DATA SCIENCE STUDIO & VISUALIZATION MODAL */}
      {isConsoleOpen && (
        <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="brand-svg-logo" style={{ width: "30px", height: "30px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" />
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800 }}>SVAJNA Interactive Data Workbench</h3>
                  <div style={{ fontSize: "11px", color: "var(--orange-primary)", fontWeight: 700 }}>ENGINEERED BY ANSH RAJORE</div>
                </div>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
              {[
                { id: "profiler", label: "📊 Schema & Profiler" },
                { id: "visualizer", label: "📈 Recharts Visualizer" },
                { id: "ml", label: "🤖 Real ML Lab" },
                { id: "predictions", label: "🔮 Predictions Studio" },
                { id: "diff", label: "⚡ Dataset Diffing" },
                { id: "export", label: "📥 Import / Export" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConsoleTab(t.id as any)}
                  style={{
                    background: consoleTab === t.id ? "var(--orange-primary)" : "rgba(255,255,255,0.05)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="modal-body">
              {/* Drag & Drop File Upload Box */}
              <label className="dropzone-box" style={{ display: "block" }}>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📂</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                  Click or Drag & Drop your CSV or JSON Dataset
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  Active File: <strong style={{ color: "var(--orange-primary)" }}>{fileName}</strong> ({datasetRows.length} rows loaded)
                </div>
              </label>

              {/* TAB 1: SCHEMA PROFILER & HEALTH */}
              {consoleTab === "profiler" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Dataset Health & Column Profile</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Computed in local browser memory</p>
                    </div>
                    <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "6px 14px", borderRadius: "12px", fontWeight: 700, fontSize: "14px" }}>
                      Columns: {columnTypes.length} | Rows: {datasetRows.length}
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left", marginBottom: "20px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                        <th style={{ padding: "10px" }}>Column Name</th>
                        <th style={{ padding: "10px" }}>Inferred Type</th>
                        <th style={{ padding: "10px" }}>Sample Value</th>
                        <th style={{ padding: "10px" }}>Mean / Distinct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnTypes.map((col) => {
                        const rawVals = datasetRows.map((r) => r[col.name]);
                        const stats = col.type === "number" ? computeColumnStats(rawVals) : null;
                        return (
                          <tr key={col.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <td style={{ padding: "10px", fontWeight: 600, color: "#38bdf8" }}>{col.name}</td>
                            <td style={{ padding: "10px" }}>
                              <span className={`mockup-badge ${col.type === "number" ? "orange" : "dark"}`}>{col.type}</span>
                            </td>
                            <td style={{ padding: "10px", fontFamily: "var(--font-mono)" }}>{String(col.sample ?? "null")}</td>
                            <td style={{ padding: "10px" }}>
                              {stats ? `Mean: ${stats.mean.toFixed(2)} (IQR: ${stats.iqr.toFixed(2)})` : `Distinct: ${new Set(rawVals).size}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: RECHARTS VISUALIZER */}
              {consoleTab === "visualizer" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                    {/* 1. SCATTER CHART */}
                    <div style={{ background: "#121216", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700 }}>Bivariate Scatter Plot</h4>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <select
                            value={scatterX}
                            onChange={(e) => setScatterX(e.target.value)}
                            style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}
                          >
                            {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
                          </select>
                          <select
                            value={scatterY}
                            onChange={(e) => setScatterY(e.target.value)}
                            style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}
                          >
                            {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
                          </select>
                        </div>
                      </div>

                      <div style={{ height: "220px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="x" name={scatterX} stroke="#94a3b8" fontSize={11} />
                            <YAxis dataKey="y" name={scatterY} stroke="#94a3b8" fontSize={11} />
                            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter
                              name="Data Points"
                              data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))}
                              fill="#ff4d00"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* 2. HISTOGRAM CHART */}
                    <div style={{ background: "#121216", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700 }}>Distribution Histogram</h4>
                        <select
                          value={histCol}
                          onChange={(e) => setHistCol(e.target.value)}
                          style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}
                        >
                          {numericCols.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>

                      <div style={{ height: "220px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={computeHistogram(datasetRows.map((r) => Number(r[histCol] ?? 0)))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* 3. CORRELATION HEATMAP */}
                  <div style={{ background: "#121216", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px" }}>Pearson Correlation Matrix Heatmap</h4>
                    {corrData.cols.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ borderCollapse: "collapse", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "8px" }}></th>
                              {corrData.cols.map((col) => (
                                <th key={col} style={{ padding: "8px", color: "#38bdf8", textAlign: "center" }}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {corrData.cols.map((rowCol, rIdx) => (
                              <tr key={rowCol}>
                                <td style={{ padding: "8px", fontWeight: 700, color: "#38bdf8" }}>{rowCol}</td>
                                {corrData.cols.map((col, cIdx) => {
                                  const val = corrData.matrix[rIdx]?.[cIdx] ?? 0;
                                  const bg = val > 0 ? `rgba(34, 197, 94, ${Math.abs(val) * 0.8})` : `rgba(239, 68, 68, ${Math.abs(val) * 0.8})`;
                                  return (
                                    <td
                                      key={col}
                                      style={{
                                        padding: "12px",
                                        textAlign: "center",
                                        background: rIdx === cIdx ? "rgba(255,77,0,0.3)" : bg,
                                        color: "#fff",
                                        borderRadius: "4px",
                                        border: "2px solid #121216",
                                      }}
                                    >
                                      {val.toFixed(2)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ color: "#94a3b8" }}>No numeric columns available for correlation heatmap.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REAL ML LAB */}
              {consoleTab === "ml" && (
                <div>
                  <div style={{ background: "#121216", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Train Local ML Model</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Algorithm</label>
                        <select
                          value={selectedAlgorithm}
                          onChange={(e) => setSelectedAlgorithm(e.target.value as any)}
                          style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px" }}
                        >
                          <option value="linear">OLS Linear Regression</option>
                          <option value="logistic">Binary Logistic Regression</option>
                          <option value="knn">KNN Classifier</option>
                          <option value="kmeans">K-Means++ Clustering</option>
                          <option value="decisionTree">Decision Tree Classifier</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target Variable (y)</label>
                        <select
                          value={selectedTarget}
                          onChange={(e) => setSelectedTarget(e.target.value)}
                          style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px" }}
                        >
                          {columnTypes.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Select Predictor Features (X)</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {numericCols.map((feat) => (
                            <button
                              key={feat}
                              onClick={() => toggleFeature(feat)}
                              style={{
                                background: selectedFeatures.includes(feat) ? "var(--orange-primary)" : "rgba(255,255,255,0.1)",
                                color: "#fff",
                                border: "none",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                            >
                              {feat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="btn-orange-pill" onClick={handleTrainModel} style={{ width: "100%", padding: "12px" }}>
                      ⚡ Train Local Model Now
                    </button>
                  </div>

                  {/* ML Results Banner */}
                  {selectedAlgorithm === "linear" && trainedLinearModel && (
                    <div style={{ background: "#16161c", padding: "20px", borderRadius: "16px" }}>
                      <h4 style={{ fontSize: "15px", color: "#4ade80", fontWeight: 700, marginBottom: "8px" }}>Linear Regression Trained</h4>
                      <div style={{ fontFamily: "var(--font-mono)", color: "#38bdf8", marginBottom: "12px" }}>{trainedLinearModel.equation}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>R² SCORE</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{trainedLinearModel.r2.toFixed(3)}</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>ADJ R²</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{trainedLinearModel.adjustedR2.toFixed(3)}</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{trainedLinearModel.rmse.toFixed(2)}</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>MAE</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{trainedLinearModel.mae.toFixed(2)}</div></div>
                      </div>
                    </div>
                  )}

                  {selectedAlgorithm === "logistic" && trainedLogisticModel && (
                    <div style={{ background: "#16161c", padding: "20px", borderRadius: "16px" }}>
                      <h4 style={{ fontSize: "15px", color: "#4ade80", fontWeight: 700, marginBottom: "8px" }}>Logistic Regression Trained</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>ACCURACY</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{(trainedLogisticModel.accuracy * 100).toFixed(1)}%</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>PRECISION</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{(trainedLogisticModel.precision * 100).toFixed(1)}%</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>RECALL</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{(trainedLogisticModel.recall * 100).toFixed(1)}%</div></div>
                        <div><span style={{ fontSize: "11px", color: "#94a3b8" }}>F1 SCORE</span><div style={{ fontSize: "18px", fontWeight: 800 }}>{(trainedLogisticModel.f1 * 100).toFixed(1)}%</div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LIVE PREDICTIONS STUDIO */}
              {consoleTab === "predictions" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Live Interactive Model Inference</h4>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>Test live predictions by supplying feature values to your trained model.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div>
                      {selectedFeatures.map((feat) => (
                        <div key={feat} style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Feature: {feat}</label>
                          <input
                            type="number"
                            value={predictionInputs[feat] ?? 0}
                            onChange={(e) => setPredictionInputs({ ...predictionInputs, [feat]: parseFloat(e.target.value) || 0 })}
                            style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px", borderRadius: "8px" }}
                          />
                        </div>
                      ))}
                      <button className="btn-orange-pill" onClick={handlePredict} style={{ width: "100%", padding: "10px" }}>
                        🔮 Generate Prediction
                      </button>
                    </div>

                    <div style={{ background: "#121216", padding: "30px", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>PREDICTED VALUE ({selectedTarget})</div>
                      <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--orange-primary)" }}>
                        {predictionOutput !== null ? String(predictionOutput) : "Ready for inference..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DATASET DIFFING */}
              {consoleTab === "diff" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Row-Level Version Comparison</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: "6px" }}>+ Added ({diffResult.added.length})</div>
                      {diffResult.added.map((r, i) => (
                        <div key={i}>{r.country || r.name} (Sales: {r.sales || r.salary})</div>
                      ))}
                    </div>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "6px" }}>- Removed ({diffResult.removed.length})</div>
                      {diffResult.removed.map((r, i) => (
                        <div key={i}>{r.country || r.name}</div>
                      ))}
                    </div>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "6px" }}>~ Modified ({diffResult.modified.length})</div>
                      {diffResult.modified.map((m, i) => (
                        <div key={i}>{m.before.country || m.before.name} → Sales {m.after.sales}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: IMPORT / EXPORT */}
              {consoleTab === "export" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>Export Transformed Dataset</h4>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="btn-orange-pill"
                      style={{ padding: "10px 20px" }}
                      onClick={() => downloadFile(exportAsCsv(datasetRows), "svajna_dataset.csv", "text/csv")}
                    >
                      📥 Download CSV File
                    </button>
                    <button
                      className="btn-orange-pill"
                      style={{ background: "#22c55e", padding: "10px 20px" }}
                      onClick={() => downloadFile(exportAsJson(datasetRows), "svajna_dataset.json", "application/json")}
                    >
                      📥 Download JSON File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
