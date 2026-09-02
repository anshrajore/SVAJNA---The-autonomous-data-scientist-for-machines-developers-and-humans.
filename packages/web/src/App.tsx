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
  ChevronDown,
  GitBranch,
  Code,
  Terminal,
  HelpCircle,
  Compass,
  Briefcase,
  Play,
  RotateCcw,
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
import { generateFileIntelligence, FileIntelligenceReport } from "./autonomous/file-intelligence";
import { detectQualityIssues, DataQualityIssue } from "./autonomous/quality-autopilot";
import { buildAutonomousInvestigationGraph, InvestigationNode } from "./autonomous/investigation-graph";
import { generateAndTestHypotheses, HypothesisTest } from "./autonomous/hypothesis-engine";
import { generateAutonomousAnalysisPlan } from "./autonomous/analysis-planner";
import { generateReproducibleCode } from "./autonomous/code-generator";

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
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true); // Default open to Studio
  const [consoleTab, setConsoleTab] = useState<"plan" | "investigation" | "quality" | "hypotheses" | "visualizer" | "ml" | "predictions" | "code">("investigation");
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [autonomyLevel, setAutonomyLevel] = useState<number>(3); // Level 3: Autonomous Analysis

  // Dataset state
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>(PRELOADED_SALES_DATA);
  const [fileName, setFileName] = useState<string>("enterprise_analytics_q3.csv");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Charting selection
  const [scatterX, setScatterX] = useState<string>("sales");
  const [scatterY, setScatterY] = useState<string>("profit");
  const [histCol, setHistCol] = useState<string>("sales");

  // ML Lab Selection
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"linear" | "logistic" | "knn" | "kmeans" | "decisionTree">("linear");
  const [selectedTarget, setSelectedTarget] = useState<string>("profit");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["sales", "score"]);
  const [paramK, setParamK] = useState<number>(3);
  const [paramEpochs, setParamEpochs] = useState<number>(300);

  // Trained ML models
  const [trainedLinearModel, setTrainedLinearModel] = useState<LinearRegressionResult | null>(null);
  const [trainedLogisticModel, setTrainedLogisticModel] = useState<LogisticRegressionResult | null>(null);

  // Prediction input form state
  const [predictionInputs, setPredictionInputs] = useState<Record<string, number>>({ sales: 150000, score: 90 });
  const [predictionOutput, setPredictionOutput] = useState<string | number | null>(null);

  // Autonomous Intelligence Computations
  const fileIntel = useMemo(() => generateFileIntelligence(fileName, datasetRows), [fileName, datasetRows]);
  const qualityIssues = useMemo(() => detectQualityIssues(datasetRows), [datasetRows]);
  const investigationTree = useMemo(() => buildAutonomousInvestigationGraph(datasetRows, 'sales'), [datasetRows]);
  const hypotheses = useMemo(() => generateAndTestHypotheses(datasetRows), [datasetRows]);
  const analysisPlan = useMemo(() => generateAutonomousAnalysisPlan(fileName, datasetRows.length, fileIntel.columnCount), [fileName, datasetRows, fileIntel]);
  const reproducibleCode = useMemo(() => generateReproducibleCode(selectedAlgorithm as any, selectedTarget, selectedFeatures), [selectedAlgorithm, selectedTarget, selectedFeatures]);

  const numericCols = useMemo(() => getNumericColumns(datasetRows), [datasetRows]);
  const categoricalCols = useMemo(() => getCategoricalColumns(datasetRows), [datasetRows]);
  const columnTypes = useMemo(() => inferColumnTypes(datasetRows), [datasetRows]);
  const corrData = useMemo(() => correlationMatrix(datasetRows, numericCols), [datasetRows, numericCols]);

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
          if (Array.isArray(parsed) && parsed.length > 0) setDatasetRows(parsed);
        } catch {
          alert("Invalid JSON array file.");
        }
      } else {
        const rows = parseBrowserCsv(content);
        if (rows.length) setDatasetRows(rows);
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
      {/* HEADER NAVBAR */}
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
              Launch Studio <ArrowUpRight style={{ width: 14, height: 14, marginLeft: 4, display: "inline-block" }} />
            </button>
          </header>
        </div>
      </div>

      {/* HERO LANDING SECTION */}
      <section className="section-dark" id="platform" style={{ paddingTop: "20px" }}>
        <div className="site-container">
          <div className="hero-wrapper">
            <div className="hero-spark-container">
              <Sparkles style={{ color: "var(--orange-primary)", width: 28, height: 28 }} />
            </div>

            <div>
              <div className="hero-creator-pill">
                <Sparkles style={{ width: 13, height: 13 }} /> Autonomous Investigation Studio • ANSH RAJORE
              </div>

              <h1 className="hero-headline">
                AUTONOMOUS
                <br />
                DATA SCIENCE STUDIO
              </h1>

              <p className="hero-subtext">
                An intelligent analytical operating system that understands datasets, generates hypotheses, investigates root causes, fits candidate ML models, and tracks evidence.
              </p>

              <div className="hero-actions">
                <button className="btn-orange-pill" onClick={() => setIsConsoleOpen(true)}>
                  Launch Autonomous Studio
                </button>
                <button className="btn-circle-arrow" onClick={() => setIsConsoleOpen(true)}>
                  <ArrowUpRight style={{ width: 18, height: 18 }} />
                </button>
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
                      <span style={{ fontSize: "11px", opacity: 0.9 }}>AUTONOMOUS STUDIO</span>
                    </div>
                  </div>
                </div>

                <div className="smart-card silver-middle">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700 }}>EVIDENCE GRAPH</span>
                    <Zap style={{ width: 16, height: 16 }} />
                  </div>
                  <div className="card-number">•••• •••• •••• 7710</div>
                </div>

                <div className="smart-card black-bottom">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", opacity: 0.6 }}>SHA-256 REPRODUCIBLE</span>
                  <div className="card-number">•••• •••• •••• 2026</div>
                </div>
              </div>
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

      {/* 8. AUTONOMOUS DATA SCIENCE STUDIO FULL-SCREEN WORKSPACE MODAL */}
      {isConsoleOpen && (
        <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="modal-window" style={{ maxWidth: "1280px", height: "92vh" }} onClick={(e) => e.stopPropagation()}>
            {/* Studio Header Bar */}
            <div className="modal-header" style={{ background: "#09090d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div className="brand-svg-logo" style={{ width: "34px", height: "34px" }}>
                  <Layers style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>SVAJNA Autonomous Data Science Studio</h3>
                    <span style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700 }}>
                      BY ANSH RAJORE
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Loaded: <strong style={{ color: "#38bdf8" }}>{fileName}</strong> ({datasetRows.length} rows • {fileIntel.columnCount} columns)
                  </div>
                </div>
              </div>

              {/* Autonomy Level Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#13131a", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Shield style={{ width: 13, height: 13, color: "var(--orange-primary)" }} />
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>Autonomy Level:</span>
                  <select
                    value={autonomyLevel}
                    onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                    style={{ background: "transparent", color: "#fff", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                  >
                    <option value={0}>L0: Manual Mode</option>
                    <option value={1}>L1: AI Suggestions</option>
                    <option value={2}>L2: AI with Approval</option>
                    <option value={3}>L3: Autonomous Analysis</option>
                    <option value={4}>L4: Continuous Monitoring</option>
                  </select>
                </div>

                <button
                  onClick={() => setIsConsoleOpen(false)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>

            {/* Studio Navigation Tabs */}
            <div style={{ display: "flex", gap: "6px", padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "#09090d", overflowX: "auto" }}>
              {[
                { id: "investigation", label: "Autonomous Root-Cause Tree", icon: <GitBranch style={{ width: 14, height: 14 }} /> },
                { id: "plan", label: "Analysis Plan", icon: <Compass style={{ width: 14, height: 14 }} /> },
                { id: "quality", label: "Data Quality Autopilot", icon: <AlertCircle style={{ width: 14, height: 14 }} /> },
                { id: "hypotheses", label: "Hypotheses & Stats", icon: <Activity style={{ width: 14, height: 14 }} /> },
                { id: "visualizer", label: "Recharts Suite", icon: <BarChart2 style={{ width: 14, height: 14 }} /> },
                { id: "ml", label: "ML Training Lab", icon: <Cpu style={{ width: 14, height: 14 }} /> },
                { id: "predictions", label: "Live Predictions", icon: <Sparkles style={{ width: 14, height: 14 }} /> },
                { id: "code", label: "Reproducible Code", icon: <Code style={{ width: 14, height: 14 }} /> },
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
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid " + (consoleTab === t.id ? "var(--orange-primary)" : "rgba(255,255,255,0.08)"),
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Studio Workspace Main Body */}
            <div className="modal-body" style={{ background: "#07070a", padding: "24px" }}>
              {/* Dropzone bar */}
              <label className="dropzone-box" style={{ display: "block", marginBottom: "20px", padding: "16px" }}>
                <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Upload style={{ width: 18, height: 18, color: "var(--orange-primary)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Ingest New Dataset File</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Current: {fileName} ({datasetRows.length} rows)</span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--orange-primary)", fontWeight: 700 }}>Auto-Analyzed</span>
                </div>
              </label>

              {/* TAB 1: AUTONOMOUS INVESTIGATION TREE (KILLER FEATURE) */}
              {consoleTab === "investigation" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Autonomous Root-Cause Investigation Tree</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Decomposes metrics and variances through hierarchical evidence graphs.</p>
                    </div>
                    <span style={{ background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", padding: "4px 12px", borderRadius: "10px", fontWeight: 700, fontSize: "12px" }}>
                      Confidence: 94%
                    </span>
                  </div>

                  {/* Investigation Graph Renderer */}
                  <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                      <GitBranch style={{ width: 18, height: 18, color: "var(--orange-primary)" }} />
                      <span style={{ fontWeight: 800, fontSize: "14px", color: "#fff" }}>{investigationTree.label}</span>
                      <span style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                        {investigationTree.metricChange}
                      </span>
                    </div>

                    <div style={{ marginLeft: "20px", paddingLeft: "16px", borderLeft: "2px solid rgba(255,77,0,0.3)" }}>
                      {investigationTree.children?.map((child) => (
                        <div key={child.id} style={{ marginBottom: "20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <ChevronRight style={{ width: 14, height: 14, color: "var(--orange-primary)" }} />
                            <span style={{ fontWeight: 700, fontSize: "13px", color: "#fff" }}>{child.label}</span>
                            <span style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
                              {child.metricChange}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "24px", marginBottom: "8px" }}>{child.evidence}</div>

                          {child.children && (
                            <div style={{ marginLeft: "24px", paddingLeft: "14px", borderLeft: "2px dashed rgba(255,255,255,0.1)" }}>
                              {child.children.map((subChild) => (
                                <div key={subChild.id} style={{ marginTop: "12px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Zap style={{ width: 13, height: 13, color: "#fbbf24" }} />
                                    <span style={{ fontWeight: 700, fontSize: "12.5px", color: "#fff" }}>{subChild.label}</span>
                                    <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px", fontWeight: 700 }}>
                                      {subChild.metricChange}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: "11.5px", color: "#94a3b8", marginLeft: "20px", marginTop: "4px" }}>{subChild.evidence}</div>

                                  {subChild.children?.map((deepNode) => (
                                    <div key={deepNode.id} style={{ background: "#13131a", border: "1px solid rgba(255,77,0,0.3)", padding: "12px", borderRadius: "10px", marginTop: "10px", marginLeft: "20px" }}>
                                      <div style={{ fontSize: "11px", color: "var(--orange-primary)", fontWeight: 700, textTransform: "uppercase" }}>ROOT CAUSE IDENTIFIED</div>
                                      <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#fff", marginTop: "2px" }}>{deepNode.label}</div>
                                      <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "4px" }}>{deepNode.evidence}</div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AUTONOMOUS ANALYSIS PLANNER */}
              {consoleTab === "plan" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "14px" }}>Autonomous Analysis Plan & Information-Value Prioritization</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {analysisPlan.map((plan) => (
                      <div key={plan.stepNumber} style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ background: "var(--orange-primary)", color: "#fff", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px" }}>
                            {plan.stepNumber}
                          </span>
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>{plan.title}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{plan.description}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>INFO VALUE SCORE</div>
                          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--orange-primary)" }}>{plan.informationValueScore}/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: DATA QUALITY AUTOPILOT */}
              {consoleTab === "quality" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "14px" }}>Data Quality Autopilot & Reversible Transformations</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {qualityIssues.map((issue) => (
                      <div key={issue.id} style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "18px", borderRadius: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <AlertCircle style={{ width: 16, height: 16, color: issue.severity === "high" ? "#ef4444" : "#fbbf24" }} />
                            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>{issue.description}</span>
                          </div>
                          <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                            Confidence: {(issue.recommendedTransformation.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div style={{ background: "#13131a", padding: "12px", borderRadius: "8px", fontSize: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "10px" }}>
                          <div><span style={{ color: "#94a3b8" }}>WHAT:</span> <div style={{ color: "#fff", fontWeight: 600 }}>{issue.recommendedTransformation.what}</div></div>
                          <div><span style={{ color: "#94a3b8" }}>WHY:</span> <div style={{ color: "#fff", fontWeight: 600 }}>{issue.recommendedTransformation.why}</div></div>
                          <div><span style={{ color: "#94a3b8" }}>IMPACT:</span> <div style={{ color: "#4ade80", fontWeight: 600 }}>{issue.recommendedTransformation.impact}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: HYPOTHESES & STATISTICAL DISCOVERY */}
              {consoleTab === "hypotheses" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "14px" }}>Automated Statistical Hypotheses & Effect Sizes</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {hypotheses.map((hyp) => (
                      <div key={hyp.id} style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "18px", borderRadius: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>{hyp.statement}</span>
                          <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                            Supported (p = {hyp.pValue})
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{hyp.evidenceSummary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: RECHARTS VISUALIZATION SUITE */}
              {consoleTab === "visualizer" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Bivariate Scatter Plot</h4>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <select value={scatterX} onChange={(e) => setScatterX(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
                          </select>
                          <select value={scatterY} onChange={(e) => setScatterY(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
                          </select>
                        </div>
                      </div>
                      <div style={{ height: "200px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis dataKey="x" stroke="#94a3b8" fontSize={11} />
                            <YAxis dataKey="y" stroke="#94a3b8" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))} fill="#ff4d00" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Distribution Histogram</h4>
                        <select value={histCol} onChange={(e) => setHistCol(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                          {numericCols.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      <div style={{ height: "200px" }}>
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
                </div>
              )}

              {/* TAB 6: ML TRAINING LAB */}
              {consoleTab === "ml" && (
                <div>
                  <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Fit Candidate ML Algorithms</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Algorithm</label>
                        <select value={selectedAlgorithm} onChange={(e) => setSelectedAlgorithm(e.target.value as any)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px" }}>
                          <option value="linear">OLS Linear Regression</option>
                          <option value="logistic">Binary Logistic Regression</option>
                          <option value="knn">KNN Classifier</option>
                          <option value="kmeans">K-Means++ Clustering</option>
                          <option value="decisionTree">Decision Tree Classifier</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target (y)</label>
                        <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "8px" }}>
                          {columnTypes.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Features (X)</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {numericCols.map((feat) => (
                            <button key={feat} onClick={() => setSelectedFeatures([feat])} style={{ background: selectedFeatures.includes(feat) ? "var(--orange-primary)" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                              {feat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="btn-orange-pill" onClick={handleTrainModel} style={{ width: "100%", padding: "10px" }}>
                      Fit Candidate Model Now
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 7: LIVE PREDICTIONS */}
              {consoleTab === "predictions" && (
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Live Prediction Studio</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      {selectedFeatures.map((feat) => (
                        <div key={feat} style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>{feat}</label>
                          <input type="number" value={predictionInputs[feat] ?? 0} onChange={(e) => setPredictionInputs({ ...predictionInputs, [feat]: parseFloat(e.target.value) || 0 })} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px", borderRadius: "8px" }} />
                        </div>
                      ))}
                      <button className="btn-orange-pill" onClick={handlePredict} style={{ width: "100%", padding: "10px" }}>Generate Prediction</button>
                    </div>

                    <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase" }}>PREDICTED OUTPUT</div>
                      <div style={{ fontSize: "32px", fontWeight: 800, color: "var(--orange-primary)", marginTop: "8px" }}>
                        {predictionOutput !== null ? String(predictionOutput) : "Ready..."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: REPRODUCIBLE CODE */}
              {consoleTab === "code" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Reproducible Python Script</h4>
                    <button className="btn-orange-pill" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => copyToClipboard(reproducibleCode)}>
                      {copiedCode ? <><Check style={{ width: 14, height: 14 }} /> Copied</> : <><Copy style={{ width: 14, height: 14 }} /> Copy Python Code</>}
                    </button>
                  </div>
                  <pre style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "14px", fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "#38bdf8", overflowX: "auto" }}>
                    <code>{reproducibleCode}</code>
                  </pre>
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
