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
  LineChart,
  Line,
} from "recharts";

import {
  BarChart2,
  TrendingUp,
  Cpu,
  Sparkles,
  Zap,
  Download,
  Upload,
  X,
  Copy,
  Check,
  Shield,
  Lock,
  Sliders,
  FileText,
  Table,
  Layers,
  Database,
  ArrowUpRight,
  Activity,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  PieChart as PieIcon,
  Grid,
} from "lucide-react";

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
  { id: 1, country: "USA", sales: 125000, profit: 34000, active: true, region: "North America", score: 88, churn: false },
  { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true, region: "Asia Pacific", score: 92, churn: false },
  { id: 3, country: "Germany", sales: 87000, profit: 21000, active: true, region: "Europe", score: 85, churn: false },
  { id: 4, country: "UK", sales: 65000, profit: 16000, active: false, region: "Europe", score: 79, churn: true },
  { id: 5, country: "India", sales: 142000, profit: 41000, active: true, region: "Asia Pacific", score: 95, churn: false },
  { id: 6, country: "Canada", sales: 54000, profit: 13000, active: true, region: "North America", score: 81, churn: false },
  { id: 7, country: "Australia", sales: 76000, profit: 19500, active: true, region: "Asia Pacific", score: 84, churn: false },
  { id: 8, country: "France", sales: 91000, profit: 23000, active: true, region: "Europe", score: 89, churn: false },
  { id: 9, country: "Brazil", sales: 62000, profit: 14000, active: false, region: "South America", score: 75, churn: true },
  { id: 10, country: "Singapore", sales: 115000, profit: 31000, active: true, region: "Asia Pacific", score: 94, churn: false },
];

export const App: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<number>(2);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"profiler" | "visualizer" | "ml" | "predictions" | "diff" | "export">("profiler");
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // User dataset state
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>(PRELOADED_SALES_DATA);
  const [fileName, setFileName] = useState<string>("enterprise_analytics_q3.csv");
  const [tableSearch, setTableSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

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
  const [testSplitRatio, setTestSplitRatio] = useState<number>(0.2);

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

  // Filtered dataset rows for Data Table tab
  const filteredRows = useMemo(() => {
    if (!tableSearch.trim()) return datasetRows;
    const q = tableSearch.toLowerCase();
    return datasetRows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [datasetRows, tableSearch]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Diff comparison demo
  const sampleTeamV2 = [
    { id: 1, country: "USA", sales: 145000, profit: 42000, active: true, region: "North America", score: 91, churn: false },
    { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true, region: "Asia Pacific", score: 92, churn: false },
    { id: 11, country: "South Korea", sales: 88000, profit: 22000, active: true, region: "Asia Pacific", score: 86, churn: false },
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
        const res = trainLinearRegression(datasetRows, selectedFeatures, selectedTarget, testSplitRatio);
        setTrainedLinearModel(res.train);
      } else if (selectedAlgorithm === "logistic") {
        const res = trainLogisticRegression(datasetRows, selectedFeatures, selectedTarget, { epochs: paramEpochs, testRatio: testSplitRatio });
        setTrainedLogisticModel(res);
      } else if (selectedAlgorithm === "knn") {
        const res = trainKNN(datasetRows, selectedFeatures, selectedTarget, paramK, testSplitRatio);
        setTrainedKNNModel(res);
      } else if (selectedAlgorithm === "kmeans") {
        const res = trainKMeans(datasetRows, selectedFeatures, paramK);
        setTrainedKMeansModel(res);
      } else if (selectedAlgorithm === "decisionTree") {
        const res = trainDecisionTree(datasetRows, selectedFeatures, selectedTarget, 5, testSplitRatio);
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
      setPredictionOutput(`${pred.label} (Confidence: ${(pred.probability * 100).toFixed(1)}%)`);
    } else if (selectedAlgorithm === "knn" && trainedKNNModel) {
      const inputArr = trainedKNNModel.featureNames.map((f) => predictionInputs[f] ?? 0);
      const pred = trainedKNNModel.predict(inputArr);
      setPredictionOutput(`${pred.label} (Confidence: ${(pred.confidence * 100).toFixed(1)}%)`);
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

  const PIE_COLORS = ["#ff4d00", "#38bdf8", "#4ade80", "#fbbf24", "#a855f7", "#ec4899"];

  return (
    <div>
      {/* 1. TOP NAVIGATION BAR */}
      <div className="section-dark" style={{ padding: "0 0 16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
              Launch Web Studio <ArrowUpRight style={{ width: 14, height: 14, marginLeft: 4, display: "inline-block" }} />
            </button>
          </header>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="section-dark" id="platform" style={{ paddingTop: "20px" }}>
        <div className="site-container">
          <div className="hero-wrapper">
            <div className="hero-spark-container">
              <Sparkles style={{ color: "var(--orange-primary)", width: 28, height: 28 }} />
            </div>

            <div>
              <div className="hero-creator-pill">
                <Sparkles style={{ width: 13, height: 13 }} /> Built by ANSH RAJORE • Autonomous OS
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
                  Explore Studio
                </button>
                <button className="btn-circle-arrow" onClick={() => setIsConsoleOpen(true)}>
                  <ArrowUpRight style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <div className="hero-user-badge">
                <div className="user-status-dot"></div>
                <div className="user-count-text">58 Test Suites • 100% Deterministic Execution</div>
              </div>
            </div>

            {/* 3D Smart Cards Visual */}
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
                      <span style={{ fontSize: "11px", opacity: 0.9 }}>CHIEF ARCHITECT</span>
                    </div>
                  </div>
                </div>

                <div className="smart-card silver-middle">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700 }}>DETERMINISTIC ML</span>
                    <Zap style={{ width: 16, height: 16 }} />
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
                  <span className="step-guide-text">Ingest CSV or JSON</span>
                  <span className="step-guide-num">01</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Recharts Analytics</span>
                  <span className="step-guide-num">02</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Train Local Models</span>
                  <span className="step-guide-num">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OS QUICKSTART HUB */}
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
              Run SVAJNA directly on macOS, Linux, Windows, or Docker. Zero external telemetry, 100% local execution.
            </p>
          </div>

          <div className="os-terminal-wrapper">
            <div className="os-tab-bar">
              <button className={`os-tab-btn ${osTab === "mac" ? "active" : ""}`} onClick={() => setOsTab("mac")}>
                macOS (Homebrew / npm)
              </button>
              <button className={`os-tab-btn ${osTab === "linux" ? "active" : ""}`} onClick={() => setOsTab("linux")}>
                Linux (Bash)
              </button>
              <button className={`os-tab-btn ${osTab === "win" ? "active" : ""}`} onClick={() => setOsTab("win")}>
                Windows (PowerShell)
              </button>
              <button className={`os-tab-btn ${osTab === "docker" ? "active" : ""}`} onClick={() => setOsTab("docker")}>
                Docker Sandbox
              </button>
            </div>

            <div className="os-code-content">
              <button className="copy-btn-floating" onClick={() => copyToClipboard(osCommands[osTab])}>
                {copiedCode ? <><Check style={{ width: 14, height: 14 }} /> Copied</> : <><Copy style={{ width: 14, height: 14 }} /> Copy Code</>}
              </button>
              <pre style={{ margin: 0, fontFamily: "inherit" }}>
                <code>{osCommands[osTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT & BENTO METRICS */}
      <section className="section-light" id="about">
        <div className="site-container">
          <div className="section-tag light-theme">// ABOUT THE OPERATING SYSTEM</div>
          <div className="section-header-split">
            <h2 className="section-title dark-text">
              ENGINEERED BY
              <br />
              ANSH RAJORE
            </h2>
            <p className="section-lead-desc">
              SVAJNA replaces brittle notebook scripts with verifiable, mathematically backed execution graphs.
            </p>
          </div>

          <div className="bento-stats-grid">
            <div className="bento-stat-card orange">
              <div className="stat-icon-badge black-bg">
                <Cpu style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <div>
                <div className="bento-stat-val">
                  8 <span>ML Engines</span>
                </div>
                <p className="bento-stat-desc">
                  Built-in linear, logistic, KNN, K-Means, Decision Tree, statistics, and correlation algorithms running purely in browser memory.
                </p>
              </div>
            </div>

            <div className="bento-stat-card black">
              <div className="stat-icon-badge orange-bg">
                <CheckCircle2 style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
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
              <div className="stat-icon-badge orange-bg">
                <Shield style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
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

      {/* 5. ENTERPRISE SECURITY POLICIES */}
      <section className="section-dark" id="security">
        <div className="site-container">
          <div className="hero-creator-pill">
            <Shield style={{ width: 13, height: 13 }} /> PROPRIETARY SAFETY PROTOCOLS
          </div>

          <div className="section-header-split">
            <h2 className="section-title white-text">
              MODEL SECURITY &
              <br />
              PROTECTION POLICIES
            </h2>
            <p className="section-lead-desc white-theme">
              SVAJNA anchors all analytical intelligence inside a strictly bounded security sandbox.
            </p>
          </div>

          <div className="security-grid">
            <div className="security-card">
              <div className="security-icon">
                <Lock style={{ width: 22, height: 22 }} />
              </div>
              <h3 className="security-title">Zero-Exfiltration Sandbox</h3>
              <p className="security-desc">
                Raw datasets never leave your local machine or private VPC. File profiling and model fitting occur purely in local memory.
              </p>
            </div>

            <div className="security-card">
              <div className="security-icon">
                <Database style={{ width: 22, height: 22 }} />
              </div>
              <h3 className="security-title">SHA-256 Cryptographic Lineage</h3>
              <p className="security-desc">
                Every calculation and model metric generates a deterministic SHA-256 hash stored in an append-only verifiable audit trail.
              </p>
            </div>

            <div className="security-card">
              <div className="security-icon">
                <Sliders style={{ width: 22, height: 22 }} />
              </div>
              <h3 className="security-title">Bounded Autonomy Gates</h3>
              <p className="security-desc">
                Enforces strict 0–6 autonomy levels. High-impact operations require cryptographic human-in-the-loop approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GIANT WORDMARK & FOOTER */}
      <div className="giant-3d-wordmark-container">
        <div className="giant-3d-wordmark">svajna</div>
      </div>

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
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>Recharts Suite</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsConsoleOpen(true); }}>ML Training Lab</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Security</div>
              <ul className="footer-col-links">
                <li><a href="#">Local Sandbox</a></li>
                <li><a href="#">Audit Hashes</a></li>
                <li><a href="#">Bounded Autonomy</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Resources</div>
              <ul className="footer-col-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">MCP Protocol</a></li>
                <li><a href="#">GitHub Repo</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Engineering</div>
              <ul className="footer-col-links">
                <li><a href="#">By ANSH RAJORE</a></li>
                <li><a href="#">TypeScript 5.7</a></li>
                <li><a href="#">React 18 SPA</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>Built & Engineered by <strong>ANSH RAJORE</strong>. © 2026 SVAJNA Inc. All Rights Reserved.</div>
          </div>
        </div>
      </footer>

      {/* 7. LUXURY WEB STUDIO MODAL WORKBENCH */}
      {isConsoleOpen && (
        <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="brand-svg-logo" style={{ width: "32px", height: "32px" }}>
                  <Layers style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-0.3px", color: "#fff" }}>SVAJNA Executive Analytics Studio</h3>
                  <div style={{ fontSize: "11px", color: "var(--orange-primary)", fontWeight: 700, letterSpacing: "0.5px" }}>ENGINEERED BY ANSH RAJORE</div>
                </div>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div style={{ display: "flex", gap: "8px", padding: "12px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#09090d", overflowX: "auto" }}>
              {[
                { id: "profiler", label: "Schema & Health", icon: <Table style={{ width: 14, height: 14 }} /> },
                { id: "visualizer", label: "Recharts Suite", icon: <BarChart2 style={{ width: 14, height: 14 }} /> },
                { id: "ml", label: "ML Training Lab", icon: <Cpu style={{ width: 14, height: 14 }} /> },
                { id: "predictions", label: "Live Predictions", icon: <Sparkles style={{ width: 14, height: 14 }} /> },
                { id: "diff", label: "Version Diffing", icon: <Zap style={{ width: 14, height: 14 }} /> },
                { id: "export", label: "Import / Export", icon: <Download style={{ width: 14, height: 14 }} /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConsoleTab(t.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: consoleTab === t.id ? "var(--orange-primary)" : "rgba(255,255,255,0.04)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid " + (consoleTab === t.id ? "var(--orange-primary)" : "rgba(255,255,255,0.08)"),
                    fontWeight: 600,
                    fontSize: "12.5px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Studio Main Content Area */}
            <div className="modal-body">
              {/* File Dropzone Area */}
              <label className="dropzone-box" style={{ display: "block" }}>
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
                  <Upload style={{ width: 22, height: 22, color: "var(--orange-primary)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Click or Drag & Drop Dataset File (CSV or JSON)</span>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Loaded: <strong style={{ color: "#38bdf8" }}>{fileName}</strong> ({datasetRows.length} rows • {columnTypes.length} columns)
                </div>
              </label>

              {/* TAB 1: SCHEMA PROFILER & HEALTH */}
              {consoleTab === "profiler" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>TOTAL ROWS</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>{datasetRows.length}</div>
                    </div>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>NUMERIC FIELDS</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--orange-primary)" }}>{numericCols.length}</div>
                    </div>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>CATEGORICAL FIELDS</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8" }}>{categoricalCols.length}</div>
                    </div>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>QUALITY RATING</div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80" }}>100/100</div>
                    </div>
                  </div>

                  {/* Column Inspection Table */}
                  <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Column Schema Inspection</h4>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                          <th style={{ padding: "10px" }}>Field Name</th>
                          <th style={{ padding: "10px" }}>DataType</th>
                          <th style={{ padding: "10px" }}>Sample</th>
                          <th style={{ padding: "10px" }}>Statistics / Distinct</th>
                        </tr>
                      </thead>
                      <tbody>
                        {columnTypes.map((col) => {
                          const rawVals = datasetRows.map((r) => r[col.name]);
                          const stats = col.type === "number" ? computeColumnStats(rawVals) : null;
                          return (
                            <tr key={col.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "10px", fontWeight: 600, color: "#38bdf8" }}>{col.name}</td>
                              <td style={{ padding: "10px" }}>
                                <span className={`mockup-badge ${col.type === "number" ? "orange" : "dark"}`}>{col.type}</span>
                              </td>
                              <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#e2e8f0" }}>{String(col.sample ?? "null")}</td>
                              <td style={{ padding: "10px", color: "#94a3b8" }}>
                                {stats ? `Mean: ${stats.mean.toFixed(2)} | Std: ${stats.std.toFixed(2)}` : `Unique: ${new Set(rawVals).size}`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: RECHARTS VISUALIZATION SUITE */}
              {consoleTab === "visualizer" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    {/* Bivariate Scatter Plot */}
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Scatter Plot Analysis</h4>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <select value={scatterX} onChange={(e) => setScatterX(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
                          </select>
                          <select value={scatterY} onChange={(e) => setScatterY(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
                          </select>
                        </div>
                      </div>

                      <div style={{ height: "210px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="x" name={scatterX} stroke="#94a3b8" fontSize={11} />
                            <YAxis dataKey="y" name={scatterY} stroke="#94a3b8" fontSize={11} />
                            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter name="Data Points" data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))} fill="#ff4d00" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Distribution Histogram */}
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Distribution Histogram</h4>
                        <select value={histCol} onChange={(e) => setHistCol(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                          {numericCols.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>

                      <div style={{ height: "210px" }}>
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

                  {/* Correlation Heatmap Grid */}
                  <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Pearson Correlation Matrix</h4>
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
                                  const bg = val > 0 ? `rgba(34, 197, 94, ${Math.abs(val) * 0.7})` : `rgba(239, 68, 68, ${Math.abs(val) * 0.7})`;
                                  return (
                                    <td
                                      key={col}
                                      style={{
                                        padding: "10px 14px",
                                        textAlign: "center",
                                        background: rIdx === cIdx ? "rgba(255,77,0,0.3)" : bg,
                                        color: "#fff",
                                        borderRadius: "4px",
                                        border: "2px solid #13131a",
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
                      <div style={{ color: "#94a3b8" }}>No numeric columns available.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REAL ML LAB */}
              {consoleTab === "ml" && (
                <div>
                  <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Configure & Train ML Model</h4>
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
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target (y)</label>
                        <select
                          value={selectedTarget}
                          onChange={(e) => setSelectedTarget(e.target.value)}
                          style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px" }}
                        >
                          {columnTypes.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Predictor Features (X)</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {numericCols.map((feat) => (
                            <button
                              key={feat}
                              onClick={() => toggleFeature(feat)}
                              style={{
                                background: selectedFeatures.includes(feat) ? "var(--orange-primary)" : "rgba(255,255,255,0.08)",
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

                    <button className="btn-orange-pill" onClick={handleTrainModel} style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Zap style={{ width: 16, height: 16 }} /> Fit & Train Model Now
                    </button>
                  </div>

                  {/* Model Results */}
                  {selectedAlgorithm === "linear" && trainedLinearModel && (
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <h4 style={{ fontSize: "15px", color: "#4ade80", fontWeight: 700, marginBottom: "8px" }}>OLS Linear Model Performance</h4>
                      <div style={{ fontFamily: "var(--font-mono)", color: "#38bdf8", marginBottom: "14px", fontSize: "13px" }}>{trainedLinearModel.equation}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>R² DETERMINATION</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{trainedLinearModel.r2.toFixed(3)}</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>ADJUSTED R²</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{trainedLinearModel.adjustedR2.toFixed(3)}</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE</span><div style={{ fontSize: "20px", fontWeight: 800, color: "var(--orange-primary)" }}>{trainedLinearModel.rmse.toFixed(2)}</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>MAE</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8" }}>{trainedLinearModel.mae.toFixed(2)}</div></div>
                      </div>
                    </div>
                  )}

                  {selectedAlgorithm === "logistic" && trainedLogisticModel && (
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <h4 style={{ fontSize: "15px", color: "#4ade80", fontWeight: 700, marginBottom: "12px" }}>Logistic Regression Model Metrics</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>ACCURACY</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{(trainedLogisticModel.accuracy * 100).toFixed(1)}%</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>PRECISION</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{(trainedLogisticModel.precision * 100).toFixed(1)}%</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>RECALL</span><div style={{ fontSize: "20px", fontWeight: 800, color: "var(--orange-primary)" }}>{(trainedLogisticModel.recall * 100).toFixed(1)}%</div></div>
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px" }}><span style={{ fontSize: "11px", color: "#94a3b8" }}>F1 SCORE</span><div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8" }}>{(trainedLogisticModel.f1 * 100).toFixed(1)}%</div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LIVE PREDICTIONS */}
              {consoleTab === "predictions" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Live Inference Studio</h4>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "20px" }}>Run model inference dynamically on user input feature vectors.</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      {selectedFeatures.map((feat) => (
                        <div key={feat} style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>{feat}</label>
                          <input
                            type="number"
                            value={predictionInputs[feat] ?? 0}
                            onChange={(e) => setPredictionInputs({ ...predictionInputs, [feat]: parseFloat(e.target.value) || 0 })}
                            style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px", borderRadius: "8px" }}
                          />
                        </div>
                      ))}
                      <button className="btn-orange-pill" onClick={handlePredict} style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Sparkles style={{ width: 16, height: 16 }} /> Generate Inference
                      </button>
                    </div>

                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "30px", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px" }}>PREDICTED OUTPUT ({selectedTarget})</div>
                      <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--orange-primary)" }}>
                        {predictionOutput !== null ? String(predictionOutput) : "Ready..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ROW-LEVEL DIFFING */}
              {consoleTab === "diff" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Version Row Diff Comparison</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: "6px" }}>+ Added ({diffResult.added.length})</div>
                      {diffResult.added.map((r, i) => (
                        <div key={i}>{r.country || r.name} (Sales: {r.sales})</div>
                      ))}
                    </div>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "6px" }}>- Removed ({diffResult.removed.length})</div>
                      {diffResult.removed.map((r, i) => (
                        <div key={i}>{r.country || r.name}</div>
                      ))}
                    </div>
                    <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.08)", padding: "14px", borderRadius: "12px" }}>
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
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Export Processed Datasets</h4>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="btn-orange-pill"
                      style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
                      onClick={() => downloadFile(exportAsCsv(datasetRows), "svajna_dataset.csv", "text/csv")}
                    >
                      <Download style={{ width: 16, height: 16 }} /> Download CSV File
                    </button>
                    <button
                      className="btn-orange-pill"
                      style={{ background: "#22c55e", padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px" }}
                      onClick={() => downloadFile(exportAsJson(datasetRows), "svajna_dataset.json", "application/json")}
                    >
                      <Download style={{ width: 16, height: 16 }} /> Download JSON File
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
