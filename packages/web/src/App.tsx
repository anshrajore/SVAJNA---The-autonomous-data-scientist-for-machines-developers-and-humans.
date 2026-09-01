import React, { useState } from "react";
import {
  parseBrowserCsv,
  profileDataset,
  diffRows,
  trainSimpleLinearRegression,
  calculateRegressionMetrics,
  exportDataset,
} from "./utils/browser-analysis";

const PRELOADED_SALES_DATA = [
  { id: 1, country: "USA", sales: 125000, profit: 34000, active: true },
  { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true },
  { id: 3, country: "Germany", sales: 87000, profit: 21000, active: true },
  { id: 4, country: "UK", sales: 65000, profit: 16000, active: false },
  { id: 5, country: "India", sales: 142000, profit: 41000, active: true },
  { id: 6, country: "Canada", sales: 54000, profit: 13000, active: true },
];

export const App: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<number>(2);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"profiler" | "visualizer" | "ml" | "diff" | "export">("profiler");
  const [osTab, setOsTab] = useState<"mac" | "linux" | "win" | "docker">("mac");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // User uploaded dataset state
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>(PRELOADED_SALES_DATA);
  const [fileName, setFileName] = useState<string>("sales_q3.csv");
  const [selectedNumCol, setSelectedNumCol] = useState<string>("sales");

  const profile = profileDataset(fileName, datasetRows);
  const numericColumns = profile.columns.filter((c) => c.kind === "number").map((c) => c.name);

  // Linear Regression dynamic calculations
  const xCol = numericColumns[0] ?? "sales";
  const yCol = numericColumns[1] ?? "profit";
  const regModel = trainSimpleLinearRegression(datasetRows, xCol, yCol);
  const actualY = datasetRows.map((r) => Number(r[yCol])).filter((v) => !isNaN(v));
  const predY = datasetRows.map((r) => regModel.predict(Number(r[xCol] ?? 0)));
  const regMetrics = calculateRegressionMetrics(actualY, predY);

  // Diff comparison demo
  const sampleTeamV2 = [
    { id: 1, country: "USA", sales: 145000, profit: 42000, active: true },
    { id: 2, country: "Japan", sales: 98000, profit: 27000, active: true },
    { id: 7, country: "Australia", sales: 72000, profit: 19000, active: true },
  ];
  const diffResult = diffRows(datasetRows, sampleTeamV2, "id");

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
          if (Array.isArray(parsed)) {
            setDatasetRows(parsed);
            if (parsed.length > 0) {
              const firstNum = Object.keys(parsed[0]).find((k) => typeof parsed[0][k] === "number");
              if (firstNum) setSelectedNumCol(firstNum);
            }
          }
        } catch {
          alert("Invalid JSON array file.");
        }
      } else {
        const rows = parseBrowserCsv(content);
        if (rows.length) {
          setDatasetRows(rows);
          const firstNum = Object.keys(rows[0]!).find((k) => typeof rows[0]![k] === "number");
          if (firstNum) setSelectedNumCol(firstNum);
        } else {
          alert("Unable to parse CSV data.");
        }
      }
    };
    reader.readAsText(file);
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
                <div className="user-count-text">95K+ Active Global Workspaces</div>
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
                      <span style={{ fontSize: "11px", opacity: 0.9 }}>VERIFIED PRO</span>
                    </div>
                  </div>
                </div>

                <div className="smart-card silver-middle">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700 }}>DETERMINISTIC</span>
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
                  <span className="step-guide-text">Selecting your provider</span>
                  <span className="step-guide-num">01</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Set Up Workspace</span>
                  <span className="step-guide-num">02</span>
                </div>
                <div className="step-guide-item">
                  <span className="step-guide-text">Autonomous Analysis</span>
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
                  500k <span>users</span>
                </div>
                <p className="bento-stat-desc">
                  Empowering data engineers and machine agents globally with deterministic accuracy and reproducibility.
                </p>
              </div>
            </div>

            <div className="bento-stat-card black">
              <div className="stat-icon-badge orange-bg">✓</div>
              <div>
                <div className="bento-stat-val">
                  98<span>%</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#a1a1aa" }}>
                  Accuracy rating across automated schema migration detection and numerical distribution profiling.
                </p>
              </div>
            </div>

            <div className="bento-stat-card white">
              <div className="stat-icon-badge orange-bg">★</div>
              <div>
                <div className="bento-stat-val">
                  24<span>K</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#71717a" }}>
                  Active autonomous pipelines executed and ML models tracked in local durable memory graphs.
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

              <div className="mockup-title">Latest Execution Run: run_20260901_svajna</div>

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
                    <div className="mockup-user-date">sales_pipeline.csv • 12,500 rows</div>
                  </div>
                </div>
                <span className="mockup-badge orange">100/100 Quality</span>
              </div>

              <div className="mockup-row-item">
                <div className="mockup-user-info">
                  <div className="mockup-user-avatar">ML</div>
                  <div>
                    <div className="mockup-user-name">Autonomous ML Agent</div>
                    <div className="mockup-user-date">user_churn.json • 54,000 rows</div>
                  </div>
                </div>
                <span className="mockup-badge orange">OLS Regressed</span>
              </div>

              <div className="mockup-row-item" style={{ borderBottom: "none" }}>
                <div className="mockup-user-info">
                  <div className="mockup-user-avatar">DT</div>
                  <div>
                    <div className="mockup-user-name">Statistical Drift Detector</div>
                    <div className="mockup-user-date">sensor_drift.parquet • 120,000 rows</div>
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
                <li><a href="#">Profiling Engine</a></li>
                <li><a href="#">Schema Diff</a></li>
                <li><a href="#">ML Studio</a></li>
                <li><a href="#">Drift Alerts</a></li>
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
                <li><a href="#">React 18 SPA</a></li>
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

            {/* Modal Tabs */}
            <div style={{ display: "flex", gap: "8px", padding: "14px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {[
                { id: "profiler", label: "📊 Schema & Profiler" },
                { id: "visualizer", label: "📈 Distribution Charts" },
                { id: "ml", label: "🤖 ML Regression Studio" },
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
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="modal-body">
              {/* Drag and Drop CSV/JSON Uploader Box */}
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
                  Currently Loaded: <strong style={{ color: "var(--orange-primary)" }}>{fileName}</strong> ({profile.rowCount} rows)
                </div>
              </label>

              {/* TAB 1: SCHEMA PROFILER */}
              {consoleTab === "profiler" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Dataset Health & Schema Scorecard</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Calculated deterministically without data mutation</p>
                    </div>
                    <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "6px 14px", borderRadius: "12px", fontWeight: 700, fontSize: "14px" }}>
                      Quality Score: {profile.score}/100
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left", marginBottom: "20px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                        <th style={{ padding: "10px" }}>Field Name</th>
                        <th style={{ padding: "10px" }}>Inferred Kind</th>
                        <th style={{ padding: "10px" }}>Present Cells</th>
                        <th style={{ padding: "10px" }}>Distinct Values</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.columns.map((col) => (
                        <tr key={col.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "10px", fontWeight: 600, color: "#38bdf8" }}>{col.name}</td>
                          <td style={{ padding: "10px" }}>{col.kind}</td>
                          <td style={{ padding: "10px" }}>{col.present}</td>
                          <td style={{ padding: "10px" }}>{col.distinct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: DATA VISUALIZATIONS & HISTOGRAMS */}
              {consoleTab === "visualizer" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Numerical Distribution Histogram</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Select a numeric column to render real-time frequency distribution</p>
                    </div>

                    <select
                      value={selectedNumCol}
                      onChange={(e) => setSelectedNumCol(e.target.value)}
                      style={{ background: "#1b1b22", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "10px", fontWeight: 600, fontSize: "13px" }}
                    >
                      {numericColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  {profile.stats[selectedNumCol] ? (
                    <div>
                      {/* Metric Summary Cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
                        <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>MINIMUM</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{profile.stats[selectedNumCol]?.min}</div>
                        </div>
                        <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>MAXIMUM</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{profile.stats[selectedNumCol]?.max}</div>
                        </div>
                        <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>MEAN (AVG)</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--orange-primary)" }}>{profile.stats[selectedNumCol]?.mean}</div>
                        </div>
                        <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>MEDIAN</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8" }}>{profile.stats[selectedNumCol]?.median}</div>
                        </div>
                      </div>

                      {/* Interactive Visual Histogram Bars */}
                      <div style={{ background: "#121216", padding: "20px", borderRadius: "16px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "16px", color: "#fff" }}>
                          Frequency Distribution Across Ranges:
                        </div>
                        {profile.stats[selectedNumCol]?.distribution?.map((dist) => {
                          const maxCount = Math.max(...(profile.stats[selectedNumCol]?.distribution?.map((d) => d.count) || [1]));
                          const pct = (dist.count / (maxCount || 1)) * 100;
                          return (
                            <div key={dist.label} className="chart-bar-wrap">
                              <div style={{ width: "120px", fontSize: "12px", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                                {dist.label}
                              </div>
                              <div className="chart-bar-bg">
                                <div className="chart-bar-fill" style={{ width: `${pct}%` }}></div>
                              </div>
                              <div style={{ width: "40px", fontSize: "12px", fontWeight: 700, color: "#fff", textAlign: "right" }}>
                                {dist.count}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "20px", color: "#94a3b8" }}>No numeric distributions available for this column.</div>
                  )}
                </div>
              )}

              {/* TAB 3: ML REGRESSION STUDIO */}
              {consoleTab === "ml" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Ordinary Least Squares (OLS) Linear Regression</h4>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
                    Fitting target <code>{yCol}</code> against predictor <code>{xCol}</code>
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>SLOPE (M)</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--orange-primary)" }}>{regModel.slope}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>INTERCEPT (B)</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#38bdf8" }}>{regModel.intercept}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>R² DETERMINATION</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#4ade80" }}>{regMetrics.r2}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE ERROR</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#4ade80" }}>{regMetrics.rmse}</div>
                    </div>
                  </div>

                  <div style={{ background: "#121216", padding: "16px", borderRadius: "14px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#38bdf8" }}>
                    Equation: <strong>y = {regModel.slope} * x + {regModel.intercept}</strong>
                  </div>
                </div>
              )}

              {/* TAB 4: ROW LEVEL DIFFING */}
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

              {/* TAB 5: IMPORT / EXPORT */}
              {consoleTab === "export" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>Export Transformed Dataset</h4>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      className="btn-orange-pill"
                      style={{ padding: "10px 20px" }}
                      onClick={() => alert(exportDataset(datasetRows, { format: "csv" }))}
                    >
                      Export as CSV
                    </button>
                    <button
                      className="btn-orange-pill"
                      style={{ background: "#22c55e", padding: "10px 20px" }}
                      onClick={() => alert(exportDataset(datasetRows, { format: "json" }))}
                    >
                      Export as JSON
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
