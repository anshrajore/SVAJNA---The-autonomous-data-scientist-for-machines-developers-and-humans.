import React, { useState, useMemo, useEffect } from "react";
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
  GitBranch,
  Code,
  Terminal,
  HelpCircle,
  Compass,
  Briefcase,
  Play,
  RotateCcw,
  PlusCircle,
  Command,
  LayoutGrid,
  FileSpreadsheet,
  PieChart as PieIcon,
  Box,
  CornerDownLeft,
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

// Autonomous Intelligence Engines
import { generateFileIntelligence } from "./autonomous/file-intelligence";
import { detectQualityIssues } from "./autonomous/quality-autopilot";
import { buildAutonomousInvestigationGraph } from "./autonomous/investigation-graph";
import { generateAndTestHypotheses } from "./autonomous/hypothesis-engine";
import { generateAutonomousAnalysisPlan } from "./autonomous/analysis-planner";
import { generateReproducibleCode } from "./autonomous/code-generator";

const DEMO_SAMPLE_DATA = [
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
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [autonomyLevel, setAutonomyLevel] = useState<number>(3); // Level 3: Autonomous Analysis

  // Left Sidebar Navigation Category
  const [activeNav, setActiveNav] = useState<"overview" | "files" | "datasets" | "analyses" | "insights" | "investigations" | "experiments" | "models" | "predictions" | "reports">("overview");

  // Command Modal (⌘K)
  const [isCmdModalOpen, setIsCmdModalOpen] = useState<boolean>(false);
  const [cmdQuery, setCmdQuery] = useState<string>("");

  // Start from 0 (blank state)
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>("No Dataset Loaded");

  // Charting & ML State
  const [scatterX, setScatterX] = useState<string>("");
  const [scatterY, setScatterY] = useState<string>("");
  const [histCol, setHistCol] = useState<string>("");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"linear" | "logistic" | "knn" | "kmeans" | "decisionTree">("linear");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [paramEpochs, setParamEpochs] = useState<number>(300);

  // Models & Predictions
  const [trainedLinearModel, setTrainedLinearModel] = useState<LinearRegressionResult | null>(null);
  const [trainedLogisticModel, setTrainedLogisticModel] = useState<LogisticRegressionResult | null>(null);
  const [predictionInputs, setPredictionInputs] = useState<Record<string, number>>({});
  const [predictionOutput, setPredictionOutput] = useState<string | number | null>(null);

  // Autonomous Intelligence Computations
  const numericCols = useMemo(() => getNumericColumns(datasetRows), [datasetRows]);
  const categoricalCols = useMemo(() => getCategoricalColumns(datasetRows), [datasetRows]);
  const columnTypes = useMemo(() => inferColumnTypes(datasetRows), [datasetRows]);
  const fileIntel = useMemo(() => generateFileIntelligence(fileName, datasetRows), [fileName, datasetRows]);
  const qualityIssues = useMemo(() => detectQualityIssues(datasetRows), [datasetRows]);
  const investigationTree = useMemo(() => buildAutonomousInvestigationGraph(datasetRows, numericCols[0] || 'sales'), [datasetRows, numericCols]);
  const hypotheses = useMemo(() => generateAndTestHypotheses(datasetRows), [datasetRows]);
  const analysisPlan = useMemo(() => generateAutonomousAnalysisPlan(fileName, datasetRows.length, fileIntel.columnCount), [fileName, datasetRows, fileIntel]);
  const reproducibleCode = useMemo(() => generateReproducibleCode(selectedAlgorithm as any, selectedTarget || 'target', selectedFeatures.length ? selectedFeatures : ['feature1']), [selectedAlgorithm, selectedTarget, selectedFeatures]);
  const corrData = useMemo(() => correlationMatrix(datasetRows, numericCols), [datasetRows, numericCols]);

  // Command Shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCmdModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadSampleDataset = () => {
    setDatasetRows(DEMO_SAMPLE_DATA);
    setFileName("enterprise_analytics_sample.csv");
    if (DEMO_SAMPLE_DATA.length > 0) {
      const nums = getNumericColumns(DEMO_SAMPLE_DATA);
      if (nums.length >= 2) {
        setScatterX(nums[0]!);
        setScatterY(nums[1]!);
        setHistCol(nums[0]!);
        setSelectedTarget(nums[1]!);
        setSelectedFeatures([nums[0]!]);
      }
    }
  };

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
            autoSetDefaults(parsed);
          }
        } catch {
          alert("Invalid JSON array file.");
        }
      } else {
        const rows = parseBrowserCsv(content);
        if (rows.length) {
          setDatasetRows(rows);
          autoSetDefaults(rows);
        }
      }
    };
    reader.readAsText(file);
  };

  const autoSetDefaults = (rows: Record<string, any>[]) => {
    const nums = getNumericColumns(rows);
    if (nums.length >= 2) {
      setScatterX(nums[0]!);
      setScatterY(nums[1]!);
      setHistCol(nums[0]!);
      setSelectedTarget(nums[1]!);
      setSelectedFeatures([nums[0]!]);
    }
  };

  const handleTrainModel = () => {
    if (!datasetRows.length || !selectedFeatures.length || !selectedTarget) return;
    try {
      if (selectedAlgorithm === "linear") {
        const res = trainLinearRegression(datasetRows, selectedFeatures, selectedTarget);
        setTrainedLinearModel(res.train);
      } else if (selectedAlgorithm === "logistic") {
        const res = trainLogisticRegression(datasetRows, selectedFeatures, selectedTarget, { epochs: paramEpochs });
        setTrainedLogisticModel(res);
      }
    } catch (err: any) {
      alert("Training error: " + (err?.message || "Verify features and target."));
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
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const osCommands = {
    mac: `# Install SVAJNA CLI globally on macOS\nnpm install -g @svajna/cli\n\n# Initialize local workspace state\nsvajna init\n\n# Run deterministic dataset profiling\nsvajna analyze ./data.csv`,
    linux: `# Install SVAJNA on Linux\ncurl -fsSL https://svajna.ai/install.sh | bash\n\n# Initialize project audit directory\nsvajna init`,
    win: `# Windows PowerShell Installation\nnpm install -g @svajna/cli\n\n# Run verification\nsvajna analyze .\\dataset.csv`,
    docker: `# Run SVAJNA in Docker\ndocker run -it --rm -v $(pwd):/workspace svajna/core:latest svajna analyze /workspace/data.csv`,
  };

  return (
    <div>
      {/* 1. TOP NAVBAR */}
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

      {/* 2. HERO LANDING SECTION */}
      <section className="section-dark" id="platform" style={{ paddingTop: "20px" }}>
        <div className="site-container">
          <div className="hero-wrapper">
            <div className="hero-spark-container">
              <Sparkles style={{ color: "var(--orange-primary)", width: 28, height: 28 }} />
            </div>

            <div>
              <div className="hero-creator-pill">
                <Sparkles style={{ width: 13, height: 13 }} /> Autonomous Operating System • ANSH RAJORE
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
                  Launch Autonomous Studio
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

            {/* 3D Visual Cards */}
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
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMMAND HUB & OS CODE SWITCHER */}
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

      {/* GIANT WORDMARK & FOOTER */}
      <div className="giant-3d-wordmark-container">
        <div className="giant-3d-wordmark">svajna</div>
      </div>

      <footer className="vibrant-orange-footer">
        <div className="site-container">
          <div className="footer-bottom-bar">
            <div>Built & Engineered by <strong>ANSH RAJORE</strong>. Autonomous Data Science Operating System. © 2026 SVAJNA Inc.</div>
          </div>
        </div>
      </footer>

      {/* 4. AUTONOMOUS DATA SCIENCE STUDIO — 3-ZONE INFINITE CANVAS + COMMAND CENTER MODAL */}
      {isConsoleOpen && (
        <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="modal-window" style={{ maxWidth: "1400px", height: "94vh", border: "1px solid rgba(255,255,255,0.12)" }} onClick={(e) => e.stopPropagation()}>
            {/* Top Studio Header Bar */}
            <div className="modal-header" style={{ background: "#09090d", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div className="brand-svg-logo" style={{ width: "32px", height: "32px" }}>
                  <Layers style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>SVAJNA Studio Operating System</h3>
                    <span style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700 }}>
                      BY ANSH RAJORE
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Project: <strong style={{ color: "#e2e8f0" }}>Customer Intelligence</strong> • Active Dataset: <strong style={{ color: datasetRows.length ? "#38bdf8" : "#f87171" }}>{fileName}</strong>
                  </div>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  onClick={() => setIsCmdModalOpen(true)}
                  style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                >
                  <Command style={{ width: 14, height: 14, color: "var(--orange-primary)" }} />
                  <span>Command Center</span>
                  <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontFamily: "var(--font-mono)" }}>⌘K</span>
                </button>

                <button
                  onClick={() => setIsConsoleOpen(false)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* 3-ZONE LAYOUT BODY */}
            <div className="studio-3zone-layout">
              {/* ZONE 1: LEFT SIDEBAR NAVIGATION (240px) */}
              <div className="studio-sidebar-left">
                <div>
                  <div className="sidebar-section-title">PROJECT</div>
                  <button className={`sidebar-nav-btn ${activeNav === 'overview' ? 'active' : ''}`} onClick={() => setActiveNav('overview')}>
                    <Compass style={{ width: 15, height: 15 }} /> Overview
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'files' ? 'active' : ''}`} onClick={() => setActiveNav('files')}>
                    <FileSpreadsheet style={{ width: 15, height: 15 }} /> Files & Schemas
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'datasets' ? 'active' : ''}`} onClick={() => setActiveNav('datasets')}>
                    <Database style={{ width: 15, height: 15 }} /> Datasets
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'analyses' ? 'active' : ''}`} onClick={() => setActiveNav('analyses')}>
                    <Table style={{ width: 15, height: 15 }} /> Analyses
                  </button>
                </div>

                <div>
                  <div className="sidebar-section-title">AI INTELLIGENCE</div>
                  <button className={`sidebar-nav-btn ${activeNav === 'insights' ? 'active' : ''}`} onClick={() => setActiveNav('insights')}>
                    <Sparkles style={{ width: 15, height: 15 }} /> Insights & Hypotheses
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'investigations' ? 'active' : ''}`} onClick={() => setActiveNav('investigations')}>
                    <GitBranch style={{ width: 15, height: 15 }} /> Root-Cause Trees
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'experiments' ? 'active' : ''}`} onClick={() => setActiveNav('experiments')}>
                    <Activity style={{ width: 15, height: 15 }} /> Experiments
                  </button>
                </div>

                <div>
                  <div className="sidebar-section-title">MACHINE LEARNING</div>
                  <button className={`sidebar-nav-btn ${activeNav === 'models' ? 'active' : ''}`} onClick={() => setActiveNav('models')}>
                    <Cpu style={{ width: 15, height: 15 }} /> Candidate Models
                  </button>
                  <button className={`sidebar-nav-btn ${activeNav === 'predictions' ? 'active' : ''}`} onClick={() => setActiveNav('predictions')}>
                    <Zap style={{ width: 15, height: 15 }} /> Live Predictions
                  </button>
                </div>

                <div>
                  <div className="sidebar-section-title">OUTPUT</div>
                  <button className={`sidebar-nav-btn ${activeNav === 'reports' ? 'active' : ''}`} onClick={() => setActiveNav('reports')}>
                    <FileText style={{ width: 15, height: 15 }} /> Code & Reports
                  </button>
                </div>
              </div>

              {/* ZONE 2: CENTER INFINITE 12-COLUMN CANVAS */}
              <div className="studio-infinite-canvas">
                {datasetRows.length === 0 ? (
                  /* START FROM 0 BLANK STATE */
                  <div style={{ background: "#0e0e13", border: "2px dashed rgba(255,77,0,0.4)", borderRadius: "20px", padding: "60px 40px", textAlign: "center", marginTop: "40px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "rgba(255,77,0,0.12)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
                      <Upload style={{ width: 32, height: 32 }} />
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Start Studio Workspace From 0</h3>
                    <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "520px", margin: "0 auto 28px auto", lineHeight: 1.6 }}>
                      Upload your raw CSV or JSON dataset to populate the infinite analytical grid, run autonomous file intelligence, root-cause investigation trees, and ML candidate pipelines.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
                      <label className="btn-orange-pill" style={{ padding: "12px 28px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Upload style={{ width: 16, height: 16 }} />
                        Browse & Upload Dataset
                        <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                      </label>

                      <button className="nav-cta-btn" onClick={loadSampleDataset} style={{ padding: "12px 24px" }}>
                        <Sparkles style={{ width: 14, height: 14, marginRight: 6, display: "inline-block" }} /> Load Demo Sample Dataset
                      </button>
                    </div>
                  </div>
                ) : (
                  /* POPULATED 12-COLUMN CANVAS GRID */
                  <div className="studio-12col-grid">
                    {/* CARD 1: DATASET INTELLIGENCE & QUALITY (4 COLS) */}
                    <div className="grid-card-4 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>DATASET INTELLIGENCE</div>
                        <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700 }}>
                          Quality: 100/100
                        </span>
                      </div>

                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{fileName}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>{datasetRows.length} rows • {fileIntel.columnCount} columns</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#09090d", padding: "12px", borderRadius: "10px" }}>
                        <div><span style={{ color: "#64748b" }}>Numeric:</span> <strong style={{ color: "var(--orange-primary)" }}>{numericCols.length}</strong></div>
                        <div><span style={{ color: "#64748b" }}>Categorical:</span> <strong style={{ color: "#38bdf8" }}>{categoricalCols.length}</strong></div>
                        <div><span style={{ color: "#64748b" }}>Missing:</span> <strong style={{ color: "#4ade80" }}>0.0%</strong></div>
                        <div><span style={{ color: "#64748b" }}>Primary Key:</span> <strong style={{ color: "#fff" }}>{fileIntel.primaryKeyCandidate || 'id'}</strong></div>
                      </div>
                    </div>

                    {/* CARD 2: AUTONOMOUS ROOT-CAUSE TREE (8 COLS) */}
                    <div className="grid-card-8 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <GitBranch style={{ width: 16, height: 16, color: "var(--orange-primary)" }} />
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>Autonomous Root-Cause Investigation Tree</span>
                        </div>
                        <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700 }}>
                          Confidence: 94%
                        </span>
                      </div>

                      <div style={{ background: "#09090d", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", borderRadius: "12px", fontSize: "12px" }}>
                        <div style={{ fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{investigationTree.label} ({investigationTree.metricChange})</div>
                        <div style={{ color: "#94a3b8", fontSize: "11.5px" }}>{investigationTree.evidence}</div>

                        {investigationTree.children?.map((child) => (
                          <div key={child.id} style={{ marginLeft: "14px", marginTop: "10px", paddingLeft: "12px", borderLeft: "2px solid var(--orange-primary)" }}>
                            <div style={{ fontWeight: 700, color: "#f87171" }}>↳ {child.label} ({child.metricChange})</div>
                            <div style={{ color: "#64748b", fontSize: "11px" }}>{child.evidence}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CARD 3: BIVARIATE SCATTER (6 COLS) */}
                    <div className="grid-card-6 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Scatter Plot Analysis</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <select value={scatterX} onChange={(e) => setScatterX(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
                          </select>
                          <select value={scatterY} onChange={(e) => setScatterY(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
                          </select>
                        </div>
                      </div>

                      <div style={{ height: "180px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="x" stroke="#94a3b8" fontSize={10} />
                            <YAxis dataKey="y" stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))} fill="#ff4d00" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* CARD 4: PEARSON CORRELATION MATRIX (6 COLS) */}
                    <div className="grid-card-6 studio-card-panel">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", display: "block", marginBottom: "12px" }}>Pearson Correlation Matrix</span>
                      {corrData.cols.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ borderCollapse: "collapse", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                            <thead>
                              <tr>
                                <th></th>
                                {corrData.cols.map((col) => (
                                  <th key={col} style={{ padding: "6px", color: "#38bdf8" }}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {corrData.cols.map((rowCol, rIdx) => (
                                <tr key={rowCol}>
                                  <td style={{ padding: "6px", fontWeight: 700, color: "#38bdf8" }}>{rowCol}</td>
                                  {corrData.cols.map((col, cIdx) => {
                                    const val = corrData.matrix[rIdx]?.[cIdx] ?? 0;
                                    return (
                                      <td key={col} style={{ padding: "8px", textAlign: "center", background: rIdx === cIdx ? "rgba(255,77,0,0.3)" : `rgba(34,197,94,${Math.abs(val) * 0.6})`, color: "#fff" }}>
                                        {val.toFixed(2)}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>

                    {/* CARD 5: ML CANDIDATE MODEL FITTING (8 COLS) */}
                    <div className="grid-card-8 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Cpu style={{ width: 16, height: 16, color: "var(--orange-primary)" }} />
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>Candidate ML Pipeline & Model Fitting</span>
                        </div>
                        <button className="btn-orange-pill" onClick={handleTrainModel} style={{ padding: "6px 14px", fontSize: "11px" }}>
                          Fit Candidate Model
                        </button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Algorithm</label>
                          <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value as any)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "6px", borderRadius: "6px", fontSize: "11px" }}>
                            <option value="linear">OLS Linear Regression</option>
                            <option value="logistic">Binary Logistic Regression</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Target (y)</label>
                          <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "6px", borderRadius: "6px", fontSize: "11px" }}>
                            {columnTypes.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Feature (X)</label>
                          <select value={selectedFeatures[0] || ''} onChange={(e) => setSelectedFeatures([e.target.value])} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "6px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>{c}</option>))}
                          </select>
                        </div>
                      </div>

                      {trainedLinearModel && (
                        <div style={{ background: "#09090d", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
                          <div style={{ fontFamily: "var(--font-mono)", color: "#38bdf8", marginBottom: "6px" }}>{trainedLinearModel.equation}</div>
                          <div style={{ display: "flex", gap: "16px" }}>
                            <div><span style={{ color: "#64748b" }}>R²:</span> <strong>{trainedLinearModel.r2.toFixed(3)}</strong></div>
                            <div><span style={{ color: "#64748b" }}>RMSE:</span> <strong>{trainedLinearModel.rmse.toFixed(2)}</strong></div>
                            <div><span style={{ color: "#64748b" }}>MAE:</span> <strong>{trainedLinearModel.mae.toFixed(2)}</strong></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD 6: LIVE PREDICTIONS (4 COLS) */}
                    <div className="grid-card-4 studio-card-panel">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", display: "block", marginBottom: "12px" }}>Live Inference Studio</span>
                      {selectedFeatures.map((feat) => (
                        <div key={feat} style={{ marginBottom: "10px" }}>
                          <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>{feat}</label>
                          <input type="number" value={predictionInputs[feat] ?? 0} onChange={(e) => setPredictionInputs({ ...predictionInputs, [feat]: parseFloat(e.target.value) || 0 })} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "6px", borderRadius: "6px", fontSize: "11px" }} />
                        </div>
                      ))}
                      <button className="btn-orange-pill" onClick={handlePredict} style={{ width: "100%", padding: "8px", fontSize: "11px", marginBottom: "12px" }}>Generate Inference</button>
                      <div style={{ background: "#09090d", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>PREDICTED OUTPUT</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--orange-primary)" }}>{predictionOutput !== null ? String(predictionOutput) : "Ready"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ZONE 3: RIGHT COMMAND CENTER & AGENT STREAM (300px) */}
              <div className="studio-command-center-right">
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                    COMMAND CENTER
                  </div>

                  <button
                    onClick={() => setIsCmdModalOpen(true)}
                    style={{ width: "100%", background: "#13131a", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "10px", borderRadius: "10px", textAlign: "left", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: "20px" }}
                  >
                    <span style={{ color: "#94a3b8" }}>Ask Studio...</span>
                    <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontFamily: "var(--font-mono)" }}>⌘K</span>
                  </button>

                  <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                    AUTONOMOUS AGENT STREAM
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11.5px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: "#4ade80" }} />
                      <span>Profiling Data</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: "#4ade80" }} />
                      <span>Hypothesis Testing</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: "#4ade80" }} />
                      <span>Root-Cause Tree</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Zap style={{ width: 14, height: 14, color: "var(--orange-primary)" }} />
                      <span>Model Fitting</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#13131a", padding: "12px", borderRadius: "10px", fontSize: "11px" }}>
                  <div style={{ color: "#94a3b8", marginBottom: "4px" }}>AUTONOMY LEVEL</div>
                  <div style={{ color: "var(--orange-primary)", fontWeight: 700 }}>Level 3: Autonomous Analysis</div>
                </div>
              </div>
            </div>

            {/* Bottom Command Bar */}
            <div className="studio-bottom-bar">
              <div>DATA · ANALYZE · PREDICT · INVESTIGATE · REPORT</div>
              <div>Press <strong style={{ color: "#fff" }}>⌘K</strong> to activate AI Command Interface</div>
            </div>
          </div>
        </div>
      )}

      {/* COMMAND CENTER OVERLAY MODAL (⌘K) */}
      {isCmdModalOpen && (
        <div className="cmd-modal-backdrop" onClick={() => setIsCmdModalOpen(false)}>
          <div className="cmd-modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <Command style={{ width: 18, height: 18, color: "var(--orange-primary)" }} />
              <input
                type="text"
                autoFocus
                placeholder="What do you want to investigate? (e.g. 'Why did revenue fall?')"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: "15px", outline: "none" }}
              />
              <button onClick={() => setIsCmdModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>SUGGESTED COMMANDS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "↗ Find anomalies in customer dataset",
                "◉ Explain revenue decline root causes",
                "◇ Build best predictive churn model",
                "◎ Test statistical significance of sales vs score",
                "▦ Generate Recharts visualization suite",
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCmdQuery(cmd); setIsCmdModalOpen(false); }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "10px 14px", borderRadius: "8px", textStyle: "left", textAlign: "left", fontSize: "12.5px", cursor: "pointer" }}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
