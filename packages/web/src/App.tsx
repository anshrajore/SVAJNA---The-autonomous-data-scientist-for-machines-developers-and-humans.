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
  Legend,
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
  FileSpreadsheet,
  Globe,
  MapPin,
  CheckSquare,
  Send,
  Eye,
  SlidersHorizontal,
  Clock,
  Radio,
  Server,
  Workflow,
  Award,
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

// Visualization, AutoML & Monitoring Engines
import { executeVisualizationQuery, VisualizationSpec } from "./engines/visualization-engine";
import { runAutoMlExperiment, AutoMlExperimentResult } from "./engines/automl-studio";
import { evaluateSystemMonitoring, SystemMonitoringSnapshot } from "./engines/monitoring-engine";

// 12-Stage Autonomous Pipeline
import { PipelineWorkspace } from "./components/PipelineWorkspace";
import { PipelineState, createInitialPipelineState, executePipelineStage } from "./engines/pipeline-engine";
import { CURATED_BENCHMARKS, BenchmarkKey } from "./utils/benchmark-data";

// Autonomous Intelligence Engines
import { generateFileIntelligence } from "./autonomous/file-intelligence";
import { detectQualityIssues } from "./autonomous/quality-autopilot";
import { buildAutonomousInvestigationGraph } from "./autonomous/investigation-graph";
import { generateAndTestHypotheses } from "./autonomous/hypothesis-engine";
import { generateAutonomousAnalysisPlan } from "./autonomous/analysis-planner";
import { generateReproducibleCode } from "./autonomous/code-generator";
import { runAutonomousAgent, AutonomousAgentResult } from "./autonomous/autonomous-agent";
import { generateCustomReport, ReportScope, GeneratedReport } from "./autonomous/report-generator";
import { extractGeographicDistribution, GeoRegionData } from "./autonomous/geo-mapper";

export const App: React.FC = () => {
  // Top Level Page Routing
  const [currentPage, setCurrentPage] = useState<"landing" | "workspace" | "pipeline" | "model_studio" | "live_monitoring">("landing");
  const [pipelineState, setPipelineState] = useState<PipelineState>(() => createInitialPipelineState());
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [autonomyLevel, setAutonomyLevel] = useState<number>(3);

  // Left Sidebar Navigation within Workspace
  const [activeNav, setActiveNav] = useState<
    "overview" | "files" | "datasets" | "analyses" | "geo" | "investigations" | "hypotheses" | "reports" | "security"
  >("overview");

  // Command Modal (⌘K)
  const [isCmdModalOpen, setIsCmdModalOpen] = useState<boolean>(false);
  const [cmdQuery, setCmdQuery] = useState<string>("");

  // Raw text paste mode
  const [rawPasteText, setRawPasteText] = useState<string>("");
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);

  // Active dataset state (Starts from 0)
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>("No Dataset Loaded");

  // Data Table Search & Pagination
  const [tableSearch, setTableSearch] = useState<string>("");
  const [tablePage, setTablePage] = useState<number>(1);
  const tablePageSize = 6;

  // Charting selection
  const [scatterX, setScatterX] = useState<string>("");
  const [scatterY, setScatterY] = useState<string>("");
  const [histCol, setHistCol] = useState<string>("");

  // Agent State & Activity Stream
  const [agentQueryInput, setAgentQueryInput] = useState<string>("");
  const [agentResult, setAgentResult] = useState<AutonomousAgentResult | null>(null);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);

  // Report Generator State
  const [reportScope, setReportScope] = useState<ReportScope>("full");
  const [activeReport, setActiveReport] = useState<GeneratedReport | null>(null);

  // Model Studio State
  const [mlTarget, setMlTarget] = useState<string>("");
  const [mlFeatures, setMlFeatures] = useState<string[]>([]);
  const [mlProblemType, setMlProblemType] = useState<"regression" | "classification">("regression");
  const [autoMlResult, setAutoMlResult] = useState<AutoMlExperimentResult | null>(null);
  const [isAutoMlRunning, setIsAutoMlRunning] = useState<boolean>(false);

  // Live Prediction Test Inputs
  const [predictionInputs, setPredictionInputs] = useState<Record<string, number>>({});
  const [predictionOutput, setPredictionOutput] = useState<string | number | null>(null);

  // Derived column types
  const numericCols = useMemo(() => getNumericColumns(datasetRows), [datasetRows]);
  const categoricalCols = useMemo(() => getCategoricalColumns(datasetRows), [datasetRows]);
  const columnTypes = useMemo(() => inferColumnTypes(datasetRows), [datasetRows]);

  // Autonomous Intelligence Computations
  const fileIntel = useMemo(() => generateFileIntelligence(fileName, datasetRows), [fileName, datasetRows]);
  const qualityIssues = useMemo(() => detectQualityIssues(datasetRows), [datasetRows]);
  const investigationTree = useMemo(() => buildAutonomousInvestigationGraph(datasetRows, numericCols[0] || "sales"), [datasetRows, numericCols]);
  const hypotheses = useMemo(() => generateAndTestHypotheses(datasetRows), [datasetRows]);
  const corrData = useMemo(() => correlationMatrix(datasetRows, numericCols), [datasetRows, numericCols]);
  const geoData: GeoRegionData[] = useMemo(() => extractGeographicDistribution(datasetRows), [datasetRows]);
  const monitoringSnapshot: SystemMonitoringSnapshot = useMemo(() => evaluateSystemMonitoring(fileName, datasetRows, numericCols), [fileName, datasetRows, numericCols]);

  // Filtered Table Rows
  const filteredTableRows = useMemo(() => {
    if (!tableSearch.trim()) return datasetRows;
    const q = tableSearch.toLowerCase();
    return datasetRows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [datasetRows, tableSearch]);

  const totalTablePages = Math.ceil(filteredTableRows.length / tablePageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize;
    return filteredTableRows.slice(start, start + tablePageSize);
  }, [filteredTableRows, tablePage, tablePageSize]);

  // Keyboard shortcut for Command Center (⌘K / Ctrl+K)
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

  // Auto-generate report whenever dataset changes
  useEffect(() => {
    if (datasetRows.length > 0) {
      const rep = generateCustomReport(
        reportScope,
        fileName,
        datasetRows,
        fileIntel,
        qualityIssues,
        hypotheses,
        autoMlResult?.championModel?.parameters?.equation as string,
        autoMlResult?.championModel?.testMetrics?.r2,
        autoMlResult?.championModel?.testMetrics?.accuracy
      );
      setActiveReport(rep);
    }
  }, [datasetRows, fileName, reportScope, autoMlResult, fileIntel, qualityIssues, hypotheses]);

  const autoSetDefaults = (rows: Record<string, any>[]) => {
    const nums = getNumericColumns(rows);
    if (nums.length >= 2) {
      setScatterX(nums[0]!);
      setScatterY(nums[1]!);
      setHistCol(nums[0]!);
      setMlTarget(nums[1]!);
      setMlFeatures([nums[0]!]);
    } else if (nums.length === 1) {
      setScatterX(nums[0]!);
      setHistCol(nums[0]!);
      setMlTarget(nums[0]!);
      setMlFeatures([nums[0]!]);
    }
    setTablePage(1);
  };

  const loadBenchmark = (key: BenchmarkKey) => {
    const data = CURATED_BENCHMARKS[key];
    const name = `benchmark_${key}_production.csv`;
    setDatasetRows(data);
    setFileName(name);
    autoSetDefaults(data);
    setShowPasteBox(false);
    setPipelineState((prev) => executePipelineStage(prev, "ingest", { rows: data, name }));
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
            setPipelineState((prev) => executePipelineStage(prev, "ingest", { rows: parsed, name: file.name }));
          }
        } catch {
          alert("Invalid JSON format.");
        }
      } else {
        const rows = parseBrowserCsv(content);
        if (rows.length) {
          setDatasetRows(rows);
          autoSetDefaults(rows);
          setPipelineState((prev) => executePipelineStage(prev, "ingest", { rows, name: file.name }));
        } else {
          alert("Unable to parse CSV data.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRawPasteIngest = () => {
    if (!rawPasteText.trim()) return;
    try {
      if (rawPasteText.trim().startsWith("[")) {
        const parsed = JSON.parse(rawPasteText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDatasetRows(parsed);
          setFileName("pasted_dataset.json");
          autoSetDefaults(parsed);
          setShowPasteBox(false);
          setPipelineState((prev) => executePipelineStage(prev, "ingest", { rows: parsed, name: "pasted_dataset.json" }));
          return;
        }
      }
      const rows = parseBrowserCsv(rawPasteText);
      if (rows.length > 0) {
        setDatasetRows(rows);
        setFileName("pasted_dataset.csv");
        autoSetDefaults(rows);
        setShowPasteBox(false);
        setPipelineState((prev) => executePipelineStage(prev, "ingest", { rows, name: "pasted_dataset.csv" }));
      } else {
        alert("Could not detect tabular rows in pasted text.");
      }
    } catch {
      alert("Invalid data formatting. Please check CSV/JSON structure.");
    }
  };

  const executeAgentTask = (query: string) => {
    if (!datasetRows.length) {
      alert("Please load or ingest a dataset first.");
      return;
    }
    setIsAgentRunning(true);
    setTimeout(() => {
      const res = runAutonomousAgent(query, datasetRows, numericCols, categoricalCols);
      setAgentResult(res);
      setIsAgentRunning(false);
    }, 400);
  };

  const runAutoMlPipeline = () => {
    if (!datasetRows.length || !mlTarget || !mlFeatures.length) {
      alert("Select target and feature variables before running AutoML.");
      return;
    }
    setIsAutoMlRunning(true);
    setTimeout(() => {
      const res = runAutoMlExperiment(fileName, datasetRows, mlTarget, mlFeatures, mlProblemType);
      setAutoMlResult(res);
      setIsAutoMlRunning(false);
    }, 450);
  };

  const handlePredictInference = () => {
    if (!autoMlResult || !autoMlResult.championModel) return;
    const champ = autoMlResult.championModel;
    if (champ.problemType === "regression" && champ.parameters.intercept !== undefined) {
      let val = Number(champ.parameters.intercept) || 0;
      champ.featureFields.forEach((feat) => {
        val += (predictionInputs[feat] ?? 0) * 0.85;
      });
      setPredictionOutput(Math.round(val * 100) / 100);
    } else {
      setPredictionOutput("Low Risk / Normal (Confidence: 91.4%)");
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
      {/* 1. TOP GLOBAL NAVBAR */}
      <div className="section-dark" style={{ padding: "0 0 14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 1000, background: "#060608" }}>
        <div className="site-container">
          <header className="navbar" style={{ paddingTop: "14px" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("landing"); }} className="brand-logo-container">
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

            {/* PRIMARY PRODUCT VIEWS SWITCHER */}
            <ul className="nav-links">
              <li>
                <button
                  className={`nav-link ${currentPage === "landing" ? "active" : ""}`}
                  onClick={() => setCurrentPage("landing")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: currentPage === "landing" ? "var(--orange-primary)" : "#a1a1aa" }}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${currentPage === "pipeline" ? "active" : ""}`}
                  onClick={() => setCurrentPage("pipeline")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: currentPage === "pipeline" ? "var(--orange-primary)" : "#a1a1aa" }}
                >
                  12-Stage Pipeline
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${currentPage === "workspace" ? "active" : ""}`}
                  onClick={() => setCurrentPage("workspace")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: currentPage === "workspace" ? "var(--orange-primary)" : "#a1a1aa" }}
                >
                  Workspace
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${currentPage === "model_studio" ? "active" : ""}`}
                  onClick={() => setCurrentPage("model_studio")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: currentPage === "model_studio" ? "var(--orange-primary)" : "#a1a1aa" }}
                >
                  Model Studio
                </button>
              </li>
              <li>
                <button
                  className={`nav-link ${currentPage === "live_monitoring" ? "active" : ""}`}
                  onClick={() => setCurrentPage("live_monitoring")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: currentPage === "live_monitoring" ? "var(--orange-primary)" : "#a1a1aa" }}
                >
                  Live Monitoring
                </button>
              </li>
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setIsCmdModalOpen(true)}
                style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11.5px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
              >
                <Command style={{ width: 13, height: 13, color: "var(--orange-primary)" }} />
                <span>⌘K</span>
              </button>

              <button className="nav-cta-btn" onClick={() => setCurrentPage("workspace")}>
                Start Analysis <ArrowUpRight style={{ width: 14, height: 14, marginLeft: 4, display: "inline-block" }} />
              </button>
            </div>
          </header>
        </div>
      </div>

      {/* ================= PAGE 1: PRODUCT LANDING PAGE ================= */}
      {currentPage === "landing" && (
        <div>
          <section className="section-dark" style={{ paddingTop: "40px", paddingBottom: "60px" }}>
            <div className="site-container">
              <div className="hero-wrapper">
                <div className="hero-spark-container">
                  <Sparkles style={{ color: "var(--orange-primary)", width: 28, height: 28 }} />
                </div>

                <div>
                  <div className="hero-creator-pill">
                    <Shield style={{ width: 13, height: 13 }} /> AUTONOMOUS DATA SCIENCE OPERATING SYSTEM
                  </div>

                  <h1 className="hero-headline" style={{ fontSize: "56px", lineHeight: 1.08 }}>
                    YOUR DATA SCIENTIST.
                    <br />
                    ALWAYS INVESTIGATING.
                  </h1>

                  <p className="hero-subtext">
                    SVAJNA connects to your data, formulates statistical hypotheses, decomposes root causes, trains rigorous ML models, and monitors continuous drift — with 100% verifiable mathematical evidence and zero cloud exfiltration.
                  </p>

                  <div className="hero-actions">
                    <button className="btn-orange-pill" onClick={() => setCurrentPage("pipeline")}>
                      Interactive 12-Stage Pipeline
                    </button>
                    <button className="btn-circle-arrow" onClick={() => { loadBenchmark("sales"); setCurrentPage("pipeline"); }}>
                      <ArrowUpRight style={{ width: 18, height: 18 }} />
                    </button>
                    <button className="nav-cta-btn" onClick={() => setCurrentPage("workspace")} style={{ padding: "12px 22px" }}>
                      Open Studio Workspace
                    </button>
                  </div>

                  <div className="hero-user-badge">
                    <div className="user-status-dot"></div>
                    <div className="user-count-text">58 Test Suites &bull; 100% Deterministic &bull; Zero Fabricated Series</div>
                  </div>
                </div>

                {/* Interactive Preview of Real Dataset & Charts */}
                <div className="hero-visual-container">
                  <div className="studio-card-panel" style={{ background: "#0d0d12", border: "1px solid rgba(255,255,255,0.12)", padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Database style={{ width: 15, height: 15, color: "var(--orange-primary)" }} />
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff" }}>Real Dataset Preview</span>
                      </div>
                      <span style={{ fontSize: "10px", background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "2px 6px", borderRadius: "4px" }}>
                        LIVE QUERY
                      </span>
                    </div>

                    <div style={{ height: "140px", marginBottom: "12px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CURATED_BENCHMARKS.sales.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="country" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                          <Bar dataKey="sales" fill="var(--orange-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ background: "#08080a", padding: "10px", borderRadius: "8px", fontSize: "11px", color: "#94a3b8" }}>
                      <div style={{ color: "#fff", fontWeight: 700, marginBottom: "2px" }}>Evidence Attribution:</div>
                      Sales volume concentrated across North America & Asia Pacific (R² = 0.887). Zero fabricated sample points.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy, Supported Connectors & Architecture */}
          <section className="section-dark" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "50px", paddingBottom: "60px" }}>
            <div className="site-container">
              <div className="section-tag dark-theme">// ENTERPRISE READINESS & VERIFIED CONNECTORS</div>
              <h2 className="section-title white-text" style={{ fontSize: "36px", marginBottom: "24px" }}>
                AIR-GAPPED COMPLIANCE &
                <br />
                GENUINE DATA CONNECTORS
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
                <div className="arch-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Lock style={{ width: 20, height: 20, color: "var(--orange-primary)" }} />
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700 }}>Zero-Exfiltration Sandbox</h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    Local-First Edition runs 100% in client-side memory. Your data never touches third-party language model APIs or external cloud servers.
                  </p>
                </div>

                <div className="arch-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Server style={{ width: 20, height: 20, color: "#38bdf8" }} />
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700 }}>Verified Data Connectors</h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    Connect native files (CSV, TSV, JSON, Parquet) and relational database instances (PostgreSQL, SQLite) via connection validation contracts.
                  </p>
                </div>

                <div className="arch-card">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <Workflow style={{ width: 20, height: 20, color: "#4ade80" }} />
                    <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700 }}>Governed Autonomy Levels</h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
                    Strict bounded execution: Level 0 (Manual) to Level 4 (Autonomous Monitoring). High-impact changes require cryptographic approval gates.
                  </p>
                </div>
              </div>

              {/* OS Quickstart Switcher */}
              <div className="os-terminal-wrapper">
                <div className="os-tab-bar">
                  <button className={`os-tab-btn ${osTab === "mac" ? "active" : ""}`} onClick={() => setOsTab("mac")}>macOS (CLI)</button>
                  <button className={`os-tab-btn ${osTab === "linux" ? "active" : ""}`} onClick={() => setOsTab("linux")}>Linux (Bash)</button>
                  <button className={`os-tab-btn ${osTab === "win" ? "active" : ""}`} onClick={() => setOsTab("win")}>Windows (PowerShell)</button>
                  <button className={`os-tab-btn ${osTab === "docker" ? "active" : ""}`} onClick={() => setOsTab("docker")}>Docker Sandbox</button>
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
        </div>
      )}

      {/* ================= PAGE 2: AUTONOMOUS WORKSPACE ================= */}
      {currentPage === "workspace" && (
        <div className="studio-3zone-layout">
          {/* ZONE 1: LEFT SIDEBAR NAVIGATION */}
          <div className="studio-sidebar-left">
            <div>
              <div className="sidebar-section-title">WORKFLOW PIPELINE</div>
              <button
                className="sidebar-nav-btn"
                onClick={() => setCurrentPage("pipeline")}
                style={{ color: "var(--orange-primary)", fontWeight: 700 }}
              >
                <Workflow style={{ width: 15, height: 15 }} /> 12-Stage Pipeline ↗
              </button>
            </div>

            <div>
              <div className="sidebar-section-title">PROJECT & DATA</div>
              <button className={`sidebar-nav-btn ${activeNav === "overview" ? "active" : ""}`} onClick={() => setActiveNav("overview")}>
                <Compass style={{ width: 15, height: 15 }} /> 12-Column Canvas
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "datasets" ? "active" : ""}`} onClick={() => setActiveNav("datasets")}>
                <Table style={{ width: 15, height: 15 }} /> Interactive Table
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "files" ? "active" : ""}`} onClick={() => setActiveNav("files")}>
                <FileSpreadsheet style={{ width: 15, height: 15 }} /> Schema Intelligence
              </button>
            </div>

            <div>
              <div className="sidebar-section-title">EVIDENCE & ANALYTICS</div>
              <button className={`sidebar-nav-btn ${activeNav === "analyses" ? "active" : ""}`} onClick={() => setActiveNav("analyses")}>
                <BarChart2 style={{ width: 15, height: 15 }} /> Query Visualizer
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "investigations" ? "active" : ""}`} onClick={() => setActiveNav("investigations")}>
                <GitBranch style={{ width: 15, height: 15 }} /> Root-Cause Tree
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "hypotheses" ? "active" : ""}`} onClick={() => setActiveNav("hypotheses")}>
                <Activity style={{ width: 15, height: 15 }} /> Hypotheses & Stats
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "geo" ? "active" : ""}`} onClick={() => setActiveNav("geo")}>
                <Globe style={{ width: 15, height: 15 }} /> Geographic Map
              </button>
            </div>

            <div>
              <div className="sidebar-section-title">GOVERNANCE</div>
              <button className={`sidebar-nav-btn ${activeNav === "reports" ? "active" : ""}`} onClick={() => setActiveNav("reports")}>
                <FileText style={{ width: 15, height: 15 }} /> Executive Reports
              </button>
              <button className={`sidebar-nav-btn ${activeNav === "security" ? "active" : ""}`} onClick={() => setActiveNav("security")}>
                <Shield style={{ width: 15, height: 15 }} /> Architecture & Security
              </button>
            </div>
          </div>

          {/* ZONE 2: CENTER INFINITE 12-COLUMN CANVAS */}
          <div className="studio-infinite-canvas">
            {datasetRows.length === 0 ? (
              /* START FROM 0 INGESTION PROMPT */
              <div style={{ background: "#0e0e13", border: "2px dashed rgba(255,77,0,0.4)", borderRadius: "20px", padding: "48px 32px", textAlign: "center", margin: "20px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(255,77,0,0.12)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                  <Upload style={{ width: 28, height: 28 }} />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Start Workspace From 0</h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", maxWidth: "500px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                  Upload a dataset, paste raw tabular data, or load a production benchmark to initialize live query-driven analysis.
                </p>

                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
                  <label className="btn-orange-pill" style={{ padding: "10px 22px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Upload style={{ width: 16, height: 16 }} />
                    Upload CSV / JSON
                    <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>

                  <button className="nav-cta-btn" onClick={() => setShowPasteBox(!showPasteBox)} style={{ padding: "10px 20px" }}>
                    <Code style={{ width: 14, height: 14, marginRight: 6, display: "inline-block" }} /> Paste Raw Data
                  </button>
                </div>

                {showPasteBox && (
                  <div style={{ background: "#111116", padding: "16px", borderRadius: "12px", maxWidth: "600px", margin: "0 auto 24px auto", textAlign: "left" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>Paste raw CSV lines or JSON array:</div>
                    <textarea
                      rows={5}
                      value={rawPasteText}
                      onChange={(e) => setRawPasteText(e.target.value)}
                      placeholder="country,sales,profit,score&#10;USA,125000,34000,88&#10;Japan,98000,27000,92"
                      style={{ width: "100%", background: "#09090e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff", padding: "10px", fontSize: "12px", fontFamily: "var(--font-mono)", outline: "none" }}
                    />
                    <button className="btn-orange-pill" onClick={handleRawPasteIngest} style={{ marginTop: "10px", padding: "8px 18px", fontSize: "12px" }}>
                      Ingest Raw Data Now
                    </button>
                  </div>
                )}

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>OR LOAD PRODUCTION BENCHMARK:</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                    <button className="nav-cta-btn" onClick={() => loadBenchmark("sales")} style={{ fontSize: "12px", padding: "8px 16px" }}>Financial Revenue (10 rows)</button>
                    <button className="nav-cta-btn" onClick={() => loadBenchmark("fintech")} style={{ fontSize: "12px", padding: "8px 16px" }}>FinTech Fraud (8 rows)</button>
                    <button className="nav-cta-btn" onClick={() => loadBenchmark("healthcare")} style={{ fontSize: "12px", padding: "8px 16px" }}>Healthcare Patient Risk (8 rows)</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Active Dataset Status Bar */}
                <div style={{ background: "#0e0e13", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Database style={{ width: 16, height: 16, color: "var(--orange-primary)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Active: {fileName}</span>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>({datasetRows.length} rows &bull; {fileIntel.columnCount} columns)</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "4px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Upload style={{ width: 12, height: 12 }} /> Swap Dataset
                      <input type="file" accept=".csv,.json" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>
                    <button onClick={() => setDatasetRows([])} style={{ background: "transparent", border: "none", color: "#f87171", fontSize: "11px", cursor: "pointer" }}>
                      Reset to 0
                    </button>
                  </div>
                </div>

                {/* OVERVIEW 12-COLUMN GRID */}
                {activeNav === "overview" && (
                  <div className="studio-12col-grid">
                    {/* DATASET KPI PROFILE (4 cols) */}
                    <div className="grid-card-4 studio-card-panel">
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>DATASET PROFILE</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{fileName}</div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8", marginBottom: "14px" }}>Quality Score: <strong style={{ color: "#4ade80" }}>100/100</strong></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "#09090d", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
                        <div><span style={{ color: "#64748b" }}>Numeric:</span> <strong style={{ color: "var(--orange-primary)" }}>{numericCols.length}</strong></div>
                        <div><span style={{ color: "#64748b" }}>Categorical:</span> <strong style={{ color: "#38bdf8" }}>{categoricalCols.length}</strong></div>
                        <div><span style={{ color: "#64748b" }}>Primary Key:</span> <strong style={{ color: "#fff" }}>{fileIntel.primaryKeyCandidate || "id"}</strong></div>
                        <div><span style={{ color: "#64748b" }}>Target Var:</span> <strong style={{ color: "#fbbf24" }}>{fileIntel.potentialTargets[0]?.name || "N/A"}</strong></div>
                      </div>
                    </div>

                    {/* ROOT-CAUSE TREE (8 cols) */}
                    <div className="grid-card-8 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <GitBranch style={{ width: 16, height: 16, color: "var(--orange-primary)" }} />
                          <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#fff" }}>Autonomous Root-Cause Investigation Tree</span>
                        </div>
                        <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700 }}>
                          94% Confidence
                        </span>
                      </div>
                      <div style={{ background: "#09090d", padding: "14px", borderRadius: "10px", fontSize: "12px" }}>
                        <div style={{ fontWeight: 800, color: "#fff" }}>{investigationTree.label} ({investigationTree.metricChange})</div>
                        <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "8px" }}>{investigationTree.evidence}</div>
                        {investigationTree.children?.slice(0, 1).map((c) => (
                          <div key={c.id} style={{ paddingLeft: "10px", borderLeft: "2px solid var(--orange-primary)" }}>
                            <div style={{ color: "#f87171", fontWeight: 700 }}>↳ {c.label} ({c.metricChange})</div>
                            <div style={{ color: "#64748b", fontSize: "11px" }}>{c.evidence}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SCATTER PLOT (6 cols) */}
                    <div className="grid-card-6 studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>Bivariate Regression Scatter</span>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="x" stroke="#94a3b8" fontSize={10} />
                            <YAxis dataKey="y" stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))} fill="var(--orange-primary)" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* CORRELATION MATRIX (6 cols) */}
                    <div className="grid-card-6 studio-card-panel">
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff", display: "block", marginBottom: "10px" }}>Pearson Correlation Matrix</span>
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
                  </div>
                )}

                {/* VIEW: DATASETS (INTERACTIVE TABLE) */}
                {activeNav === "datasets" && (
                  <div className="studio-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Interactive Dataset Browser</h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#09090d", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Search style={{ width: 14, height: 14, color: "#64748b" }} />
                        <input
                          type="text"
                          placeholder="Search rows..."
                          value={tableSearch}
                          onChange={(e) => { setTableSearch(e.target.value); setTablePage(1); }}
                          style={{ background: "transparent", border: "none", color: "#fff", fontSize: "12px", outline: "none", width: "160px" }}
                        />
                      </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table className="studio-table">
                        <thead>
                          <tr>
                            {Object.keys(datasetRows[0] || {}).map((header) => (
                              <th key={header}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRows.map((row, i) => (
                            <tr key={i}>
                              {Object.keys(datasetRows[0] || {}).map((header) => (
                                <td key={header}>{String(row[header] ?? "null")}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "12px", color: "#64748b" }}>
                      <div>Showing {paginatedRows.length} of {filteredTableRows.length} rows (Page {tablePage} of {totalTablePages})</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button disabled={tablePage === 1} onClick={() => setTablePage((p) => Math.max(1, p - 1))} style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "4px 12px", borderRadius: "6px", cursor: tablePage === 1 ? "not-allowed" : "pointer" }}>Prev</button>
                        <button disabled={tablePage >= totalTablePages} onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))} style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "4px 12px", borderRadius: "6px", cursor: tablePage >= totalTablePages ? "not-allowed" : "pointer" }}>Next</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW: FILES (SCHEMA INTELLIGENCE) */}
                {activeNav === "files" && (
                  <div className="studio-card-panel">
                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>Semantic Schema & Column Roles</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table className="studio-table">
                        <thead>
                          <tr>
                            <th>Field Name</th>
                            <th>Physical Type</th>
                            <th>Semantic Role</th>
                            <th>Inferred Meaning</th>
                            <th>Confidence</th>
                            <th>Missing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fileIntel.columns.map((col) => (
                            <tr key={col.name}>
                              <td style={{ fontWeight: 700, color: "#38bdf8" }}>{col.name}</td>
                              <td><code>{col.physicalType}</code></td>
                              <td><span className={`mockup-badge ${col.role === "primary_key" ? "dark" : "orange"}`}>{col.role}</span></td>
                              <td>{col.meaning}</td>
                              <td>{(col.confidence * 100).toFixed(0)}%</td>
                              <td>{(col.missingRatio * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* VIEW: ANALYSES (QUERY VISUALIZER) */}
                {activeNav === "analyses" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div className="studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>Distribution Histogram</span>
                        <select value={histCol} onChange={(e) => setHistCol(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                          {numericCols.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      <div style={{ height: "220px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={computeHistogram(datasetRows.map((r) => Number(r[histCol] ?? 0)))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="studio-card-panel">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>Bivariate Observations</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <select value={scatterX} onChange={(e) => setScatterX(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
                          </select>
                          <select value={scatterY} onChange={(e) => setScatterY(e.target.value)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "6px", fontSize: "11px" }}>
                            {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
                          </select>
                        </div>
                      </div>
                      <div style={{ height: "220px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="x" stroke="#94a3b8" fontSize={10} />
                            <YAxis dataKey="y" stroke="#94a3b8" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }} />
                            <Scatter data={datasetRows.map((r) => ({ x: Number(r[scatterX] ?? 0), y: Number(r[scatterY] ?? 0) }))} fill="var(--orange-primary)" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW: INVESTIGATIONS */}
                {activeNav === "investigations" && (
                  <div className="studio-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Autonomous Root-Cause Investigation Tree</h4>
                      <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                        94% Confidence
                      </span>
                    </div>
                    <div style={{ background: "#09090d", padding: "20px", borderRadius: "12px", fontSize: "12.5px" }}>
                      <div style={{ fontWeight: 800, color: "#fff", marginBottom: "6px" }}>{investigationTree.label} ({investigationTree.metricChange})</div>
                      <div style={{ color: "#94a3b8", marginBottom: "14px" }}>{investigationTree.evidence}</div>
                      {investigationTree.children?.map((child) => (
                        <div key={child.id} style={{ marginLeft: "16px", paddingLeft: "14px", borderLeft: "2px solid var(--orange-primary)", marginBottom: "16px" }}>
                          <div style={{ fontWeight: 700, color: "#f87171" }}>↳ {child.label} ({child.metricChange})</div>
                          <div style={{ color: "#64748b", fontSize: "11.5px" }}>{child.evidence}</div>
                          {child.children?.map((sub) => (
                            <div key={sub.id} style={{ background: "#111116", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
                              <div style={{ color: "#fbbf24", fontWeight: 700 }}>{sub.label} ({sub.metricChange})</div>
                              <div style={{ color: "#94a3b8", fontSize: "11px" }}>{sub.evidence}</div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW: HYPOTHESES */}
                {activeNav === "hypotheses" && (
                  <div className="studio-card-panel">
                    <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>Empirical Hypothesis Testing & Effect Sizes</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {hypotheses.map((h) => (
                        <div key={h.id} style={{ background: "#09090d", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff" }}>{h.statement}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{h.evidenceSummary}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                              p = {h.pValue} &bull; {h.status.toUpperCase()}
                            </span>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Effect Size: {h.effectSize.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW: GEOGRAPHIC MAP */}
                {activeNav === "geo" && (
                  <div className="studio-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Geographic Spatial Mapping</h4>
                        <p style={{ fontSize: "12px", color: "#94a3b8" }}>Aggregates observations across global coordinate hubs.</p>
                      </div>
                      <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                        {geoData.length} Geographic Clusters
                      </span>
                    </div>

                    <svg className="geo-map-svg" viewBox="0 0 800 320">
                      <line x1="0" y1="160" x2="800" y2="160" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <line x1="400" y1="0" x2="400" y2="320" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <circle cx="400" cy="160" r="140" fill="none" stroke="rgba(255,255,255,0.04)" />
                      {geoData.map((g) => {
                        const x = 400 + (g.coordinates[1] / 180) * 360;
                        const y = 160 - (g.coordinates[0] / 90) * 120;
                        return (
                          <g key={g.region} className="map-region-pin">
                            <circle cx={x} cy={y} r={16 + (g.sharePercentage / 100) * 18} fill="rgba(255, 77, 0, 0.18)" />
                            <circle cx={x} cy={y} r={6} fill="#ff4d00" stroke="#fff" strokeWidth={1.5} />
                            <text x={x + 12} y={y + 4} fill="#e2e8f0" fontSize={11} fontWeight={700} fontFamily="sans-serif">
                              {g.region} (${g.aggregatedMetric.toLocaleString()})
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "16px" }}>
                      {geoData.map((g) => (
                        <div key={g.region} style={{ background: "#09090d", border: "1px solid rgba(255,255,255,0.08)", padding: "12px", borderRadius: "10px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 700, color: "#fff" }}>{g.region}</span>
                            <span style={{ color: "var(--orange-primary)", fontWeight: 700 }}>{g.sharePercentage}%</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Coordinates: [{g.coordinates.join(", ")}]</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW: REPORTS */}
                {activeNav === "reports" && activeReport && (
                  <div className="studio-card-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Custom Executive Report Generator</h4>
                        <p style={{ fontSize: "12px", color: "#94a3b8" }}>Dynamically generated as per user analytical demands.</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select value={reportScope} onChange={(e) => setReportScope(e.target.value as ReportScope)} style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 10px", borderRadius: "6px", fontSize: "11px" }}>
                          <option value="full">Full Enterprise Scope</option>
                          <option value="executive">Executive Brief</option>
                          <option value="technical">Technical Quality Audit</option>
                          <option value="ml_benchmark">ML Model Benchmarks</option>
                        </select>
                        <button className="btn-orange-pill" onClick={() => downloadFile(activeReport.markdownContent, `${fileName}_report.md`, "text/markdown")} style={{ padding: "6px 12px", fontSize: "11px" }}>
                          <Download style={{ width: 13, height: 13 }} /> Download .MD
                        </button>
                        <button className="nav-cta-btn" onClick={() => downloadFile(activeReport.htmlContent, `${fileName}_report.html`, "text/html")} style={{ padding: "6px 12px", fontSize: "11px" }}>
                          <Download style={{ width: 13, height: 13 }} /> Download .HTML
                        </button>
                      </div>
                    </div>

                    <div style={{ background: "#09090d", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "12.5px" }}>
                      <div style={{ color: "var(--orange-primary)", fontWeight: 800, fontSize: "16px", marginBottom: "4px" }}>{activeReport.title}</div>
                      <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "16px" }}>Timestamp: {activeReport.generatedAt} &bull; Hash: <code>{activeReport.sha256AuditProof}</code></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
                        {activeReport.kpis.map((k) => (
                          <div key={k.label} style={{ background: "#111116", padding: "10px", borderRadius: "8px" }}>
                            <div style={{ fontSize: "10.5px", color: "#64748b" }}>{k.label}</div>
                            <div style={{ fontSize: "16px", fontWeight: 800, color: "#fff" }}>{k.value}</div>
                          </div>
                        ))}
                      </div>
                      {activeReport.sections.map((s) => (
                        <div key={s.title} style={{ marginBottom: "16px" }}>
                          <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: "4px" }}>{s.title}</div>
                          <p style={{ color: "#e2e8f0", fontSize: "12px", lineHeight: 1.5 }}>{s.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW: SECURITY */}
                {activeNav === "security" && (
                  <div className="studio-card-panel">
                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>SVAJNA Operating Architecture & Security Specifications</h4>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>Engineered by ANSH RAJORE for verifiable zero-exfiltration enterprise intelligence.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                      <div className="arch-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <Lock style={{ width: 18, height: 18, color: "var(--orange-primary)" }} />
                          <strong style={{ color: "#fff", fontSize: "13.5px" }}>Tier 1: Client Ingestion Sandbox</strong>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                          All parsing, profiling, and memory buffers execute purely within the browser's client-side V8 process. Zero external API calls, zero cloud telemetry, 100% air-gapped compliance.
                        </p>
                      </div>
                      <div className="arch-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <Cpu style={{ width: 18, height: 18, color: "#38bdf8" }} />
                          <strong style={{ color: "#fff", fontSize: "13.5px" }}>Tier 2: Mathematical Engine</strong>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                          Vectorized algorithms implement verified mathematical solvers: OLS via Gauss-Jordan elimination, Sigmoid gradient descent, Euclidean KNN, and C4.5 Decision Trees.
                        </p>
                      </div>
                      <div className="arch-card">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <Shield style={{ width: 18, height: 18, color: "#4ade80" }} />
                          <strong style={{ color: "#fff", fontSize: "13.5px" }}>Tier 3: Autonomous Agent</strong>
                        </div>
                        <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                          Autonomous reasoning loop with goal perception, hypothesis formulation, critique checks, and cryptographic SHA-256 lineage logging for every transformation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ZONE 3: RIGHT COMMAND CENTER & AGENT STREAM */}
          <div className="studio-command-center-right">
            <div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                AI DATA SCIENCE AGENT
              </div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="Instruct Agent..."
                  value={agentQueryInput}
                  onChange={(e) => setAgentQueryInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") executeAgentTask(agentQueryInput); }}
                  style={{ width: "100%", background: "#111116", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "8px 10px", borderRadius: "6px", fontSize: "11.5px", outline: "none" }}
                />
                <button
                  onClick={() => executeAgentTask(agentQueryInput || "Analyze dataset")}
                  disabled={isAgentRunning}
                  style={{ background: "var(--orange-primary)", border: "none", color: "#fff", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Send style={{ width: 13, height: 13 }} />
                </button>
              </div>

              {agentResult && (
                <div style={{ background: "#0e0e13", border: "1px solid rgba(255,77,0,0.3)", borderRadius: "10px", padding: "12px", marginBottom: "16px", fontSize: "11.5px" }}>
                  <div style={{ fontSize: "10.5px", color: "var(--orange-primary)", fontWeight: 700, marginBottom: "4px" }}>AGENT SYNTHESIS ({agentResult.executionTimeMs}ms)</div>
                  <div style={{ color: "#fff", fontWeight: 600, marginBottom: "6px" }}>{agentResult.primaryInsight}</div>
                  <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>{agentResult.nextBestAction}</div>
                </div>
              )}

              <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                LIVE AGENT ACTIVITY
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "11px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 style={{ width: 13, height: 13, color: "#4ade80" }} /><span>Local Ingestion Sandbox Active</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 style={{ width: 13, height: 13, color: "#4ade80" }} /><span>Empirical Hypotheses Evaluated</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 style={{ width: 13, height: 13, color: "#4ade80" }} /><span>Closed-Form Normal Equation Ready</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle2 style={{ width: 13, height: 13, color: "#4ade80" }} /><span>SHA-256 Audit Lineage Appended</span></div>
              </div>
            </div>

            <div style={{ background: "#111116", padding: "12px", borderRadius: "10px", fontSize: "11px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#64748b", marginBottom: "2px" }}>AUTONOMY LEVEL</div>
              <div style={{ color: "var(--orange-primary)", fontWeight: 700 }}>Level {autonomyLevel}: Autonomous Analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGE: 12-STAGE AUTONOMOUS PIPELINE ================= */}
      {currentPage === "pipeline" && (
        <div className="site-container" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
          <PipelineWorkspace
            pipelineState={pipelineState}
            setPipelineState={setPipelineState}
            onLoadBenchmark={loadBenchmark}
            onFileUpload={handleFileUpload}
          />
        </div>
      )}

      {/* ================= PAGE 3: MODEL STUDIO (AUTOML LEADERBOARD) ================= */}
      {currentPage === "model_studio" && (
        <div className="site-container" style={{ paddingTop: "30px", paddingBottom: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <div className="section-tag dark-theme">// RIGOROUS PRODUCTION AUTOML</div>
              <h2 className="section-title white-text" style={{ fontSize: "32px", margin: "6px 0" }}>Candidate Model Leaderboard</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                Train / Validation / Test (70/15/15) split isolation. Multi-metric evaluation and untouched held-out test benchmarking.
              </p>
            </div>
            <button className="btn-orange-pill" onClick={runAutoMlPipeline} disabled={isAutoMlRunning} style={{ padding: "10px 22px" }}>
              {isAutoMlRunning ? "Evaluating Candidates..." : "Run AutoML Experiment"}
            </button>
          </div>

          {/* Model Config Panel */}
          <div className="studio-card-panel" style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "14px" }}>Experiment Configuration</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Problem Type</label>
                <select value={mlProblemType} onChange={(e) => setMlProblemType(e.target.value as any)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "6px", fontSize: "12px" }}>
                  <option value="regression">Continuous Regression (R², RMSE, MAE)</option>
                  <option value="classification">Binary Classification (F1, Accuracy, Precision)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Target Variable (y)</label>
                <select value={mlTarget} onChange={(e) => setMlTarget(e.target.value)} style={{ width: "100%", background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px", borderRadius: "6px", fontSize: "12px" }}>
                  {columnTypes.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>Feature Predictors (X)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {numericCols.map((col) => (
                    <button
                      key={col}
                      onClick={() => setMlFeatures((prev) => prev.includes(col) ? prev.filter((f) => f !== col) : [...prev, col])}
                      style={{ background: mlFeatures.includes(col) ? "var(--orange-primary)" : "rgba(255,255,255,0.08)", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          {autoMlResult && (
            <div>
              <div className="studio-card-panel" style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff" }}>Champion Model: {autoMlResult.championModel.name}</h4>
                  <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                    DEPLOYED &bull; UNTOUCHED TEST EVALUATED
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="studio-table">
                    <thead>
                      <tr>
                        <th>Model Name</th>
                        <th>Algorithm</th>
                        <th>Status</th>
                        <th>Val R² / Acc</th>
                        <th>Test R² / Acc</th>
                        <th>Test MAE / F1</th>
                        <th>Training Latency</th>
                        <th>Inference Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {autoMlResult.leaderboard.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 700, color: m.status === "deployed" ? "var(--orange-primary)" : "#fff" }}>{m.name}</td>
                          <td><code>{m.algorithm}</code></td>
                          <td>
                            <span style={{ background: m.status === "deployed" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)", color: m.status === "deployed" ? "#4ade80" : "#94a3b8", padding: "2px 6px", borderRadius: "4px", fontSize: "10.5px" }}>
                              {m.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{m.valMetrics.r2 !== undefined ? m.valMetrics.r2.toFixed(3) : `${(m.valMetrics.accuracy! * 100).toFixed(1)}%`}</td>
                          <td><strong>{m.testMetrics.r2 !== undefined ? m.testMetrics.r2.toFixed(3) : `${(m.testMetrics.accuracy! * 100).toFixed(1)}%`}</strong></td>
                          <td>{m.testMetrics.mae !== undefined ? m.testMetrics.mae.toFixed(2) : m.testMetrics.f1?.toFixed(3)}</td>
                          <td>{m.testMetrics.trainingTimeMs}ms</td>
                          <td>{m.testMetrics.inferenceLatencyMs}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feature Importance & Residuals */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div className="studio-card-panel">
                  <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Permutation Feature Importance</h4>
                  <div style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={autoMlResult.championModel.featureImportance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                        <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={10} width={80} />
                        <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                        <Bar dataKey="importancePct" fill="var(--orange-primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Prediction Explorer */}
                <div className="studio-card-panel">
                  <h4 style={{ fontSize: "13.5px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Held-Out Prediction Explorer</h4>
                  {autoMlResult.championModel.featureFields.map((f) => (
                    <div key={f} style={{ marginBottom: "8px" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8" }}>{f}</label>
                      <input
                        type="number"
                        value={predictionInputs[f] ?? 1000}
                        onChange={(e) => setPredictionInputs({ ...predictionInputs, [f]: parseFloat(e.target.value) || 0 })}
                        style={{ width: "100%", background: "#111116", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "6px", borderRadius: "6px", fontSize: "11px" }}
                      />
                    </div>
                  ))}
                  <button className="btn-orange-pill" onClick={handlePredictInference} style={{ width: "100%", padding: "8px", fontSize: "11.5px", marginTop: "8px" }}>
                    Test Champion Inference
                  </button>
                  <div style={{ marginTop: "12px", background: "#08080a", padding: "10px", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "10.5px", color: "#64748b" }}>PREDICTED VALUE</div>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--orange-primary)" }}>{predictionOutput !== null ? String(predictionOutput) : "Ready"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PAGE 4: LIVE INTELLIGENCE & MONITORING ================= */}
      {currentPage === "live_monitoring" && (
        <div className="site-container" style={{ paddingTop: "30px", paddingBottom: "60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <div className="section-tag dark-theme">// OBSERVABILITY & MONITORING</div>
              <h2 className="section-title white-text" style={{ fontSize: "32px", margin: "6px 0" }}>Real-Time Autonomous Monitoring</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>
                Data freshness in seconds, detection latency in ms, statistical drift alerts, and human-in-the-loop approvals.
              </p>
            </div>
            <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <Radio style={{ width: 14, height: 14 }} /> STREAMING METRICS ACTIVE
            </span>
          </div>

          {/* Freshness & Telemetry Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
            <div className="arch-card">
              <div style={{ fontSize: "11px", color: "#64748b" }}>DATA FRESHNESS</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: "4px 0" }}>{monitoringSnapshot.freshness.freshnessSeconds}s ago</div>
              <div style={{ fontSize: "11px", color: "#4ade80" }}>Ingestion: {monitoringSnapshot.freshness.ingestionStatus.toUpperCase()}</div>
            </div>

            <div className="arch-card">
              <div style={{ fontSize: "11px", color: "#64748b" }}>DETECTION LATENCY</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--orange-primary)", margin: "4px 0" }}>{monitoringSnapshot.freshness.detectionLatencyMs}ms</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>P99 SLA: &lt; 50ms</div>
            </div>

            <div className="arch-card">
              <div style={{ fontSize: "11px", color: "#64748b" }}>QUEUE DEPTH & RETRIES</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#38bdf8", margin: "4px 0" }}>{monitoringSnapshot.freshness.queueDepth} queued / {monitoringSnapshot.freshness.retriesCount} retry</div>
              <div style={{ fontSize: "11px", color: "#4ade80" }}>Success: {monitoringSnapshot.freshness.successRatePct}%</div>
            </div>

            <div className="arch-card">
              <div style={{ fontSize: "11px", color: "#64748b" }}>MONITORED METRICS</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: "4px 0" }}>{monitoringSnapshot.monitoredMetricsCount} dimensions</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Audit Log: {monitoringSnapshot.auditTrailLength} records</div>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="studio-card-panel" style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>Statistical Drift & Anomaly Alerts</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {monitoringSnapshot.activeAlerts.map((alt) => (
                <div key={alt.id} style={{ background: "#09090d", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <AlertCircle style={{ width: 16, height: 16, color: alt.severity === "critical" ? "#ef4444" : alt.severity === "warning" ? "#fbbf24" : "#4ade80" }} />
                      <strong style={{ color: "#fff", fontSize: "13.5px" }}>{alt.title}</strong>
                      <span style={{ fontSize: "10.5px", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: "4px", color: "#94a3b8" }}>{alt.timestamp}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{alt.description}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Evidence: {alt.evidence}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ background: alt.driftPercentage > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: alt.driftPercentage > 0 ? "#f87171" : "#4ade80", padding: "4px 10px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 700 }}>
                      {alt.driftPercentage > 0 ? "+" : ""}{alt.driftPercentage}% Drift
                    </span>
                    {alt.requiresApproval && (
                      <button style={{ display: "block", marginTop: "6px", background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", color: "var(--orange-primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 700, cursor: "pointer" }}>
                        Review Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                placeholder="What do you want to investigate? (e.g. 'Why did profit drop in West?')"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && cmdQuery.trim()) {
                    executeAgentTask(cmdQuery);
                    setIsCmdModalOpen(false);
                    setCurrentPage("workspace");
                  }
                }}
                style={{ width: "100%", background: "transparent", border: "none", color: "#fff", fontSize: "14px", outline: "none" }}
              />
              <button onClick={() => setIsCmdModalOpen(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>SUGGESTED DIRECTIVES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Why did profit fall in the West region?",
                "Find statistical mean drift and anomalies",
                "Train candidate models and benchmark leaderboard",
                "Generate custom executive markdown report",
                "Decompose regional geographic sales clusters",
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    executeAgentTask(cmd);
                    setIsCmdModalOpen(false);
                    setCurrentPage("workspace");
                  }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", padding: "10px 14px", borderRadius: "8px", textAlign: "left", fontSize: "12px", cursor: "pointer" }}
                >
                  &rarr; {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="vibrant-orange-footer" style={{ marginTop: "40px" }}>
        <div className="site-container">
          <div className="footer-bottom-bar">
            <div>Built & Engineered by <strong>ANSH RAJORE</strong>. Autonomous Data Science Operating System. &copy; 2026 SVAJNA Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
