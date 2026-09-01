import React, { useState } from "react";
import {
  profileDataset,
  diffRows,
  trainSimpleLinearRegression,
  calculateRegressionMetrics,
  exportDataset,
} from "./utils/browser-analysis";

export const App: React.FC = () => {
  const [activeAccordion, setActiveAccordion] = useState<number>(2); // Default to item 03
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"profiler" | "ml" | "diff" | "export">("profiler");
  const [testimonialIndex, setTestimonialIndex] = useState<number>(0);

  // Sample Dataset for interactive demo
  const sampleTeamV1 = [
    { id: 1, name: "Alice", role: "Data Scientist", salary: 120000 },
    { id: 2, name: "Bob", role: "Software Engineer", salary: 110000 },
    { id: 3, name: "Charlie", role: "Product Designer", salary: 105000 },
  ];
  const sampleTeamV2 = [
    { id: 1, name: "Alice", role: "Lead Data Scientist", salary: 135000 },
    { id: 2, name: "Bob", role: "Software Engineer", salary: 110000 },
    { id: 4, name: "David", role: "ML Engineer", salary: 130000 },
  ];

  const profile = profileDataset("production_data.json", sampleTeamV1);
  const diff = diffRows(sampleTeamV1, sampleTeamV2, "id");

  // ML Simple Regression Demo
  const regData = [
    { x: 1, y: 3 },
    { x: 2, y: 5 },
    { x: 3, y: 7 },
    { x: 4, y: 9 },
    { x: 5, y: 11 },
  ];
  const regModel = trainSimpleLinearRegression(regData, "x", "y");
  const predictions = regData.map((d) => regModel.predict(d.x));
  const metrics = calculateRegressionMetrics(regData.map((d) => d.y), predictions);

  const testimonials = [
    {
      quote:
        "SVAJNA has completely transformed the way I analyze data and manage ML models. The real-time drift alerts and deterministic lineage proofs have been invaluable.",
      author: "Rory Williams",
      role: "Head of Data Engineering, Synthex",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote:
        "The bounded autonomy and zero-hallucination execution give our enterprise total confidence in deploying automated data science pipelines.",
      author: "Elena Rostova",
      role: "VP of Artificial Intelligence, QuantumFlow",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    },
  ];

  const accordionItems = [
    {
      id: 0,
      num: "01",
      title: "Secure and Easy Ingestion",
      desc: "Connect seamlessly to PostgreSQL, SQLite, Snowflake, or local CSV/JSON files with read-only sandbox safety.",
    },
    {
      id: 1,
      num: "02",
      title: "Real-Time Anomaly Monitoring",
      desc: "Continuous statistical validation, distribution drift detection, and automated quality scoring.",
    },
    {
      id: 2,
      num: "03",
      title: "Fast & Easy ML Pipelines",
      desc: "Deterministic OLS regression, KNN classification, decision trees, and multi-step pipeline automation.",
    },
    {
      id: 3,
      num: "04",
      title: "Verifiable Memory & Lineage",
      desc: "Every claim backed by mathematical evidence and stored in an immutable cryptographic audit store.",
    },
  ];

  return (
    <div>
      {/* 1. TOP HEADER NAVIGATION */}
      <div className="section-dark" style={{ padding: "0 0 20px 0" }}>
        <div className="site-container">
          <header className="navbar">
            <a href="#" className="brand-logo">
              <div className="brand-icon-box">✦</div>
              <span className="brand-title">svajna</span>
            </a>

            <ul className="nav-links">
              <li><a href="#platform" className="nav-link">Products</a></li>
              <li><a href="#features" className="nav-link">Features</a></li>
              <li><a href="#results" className="nav-link">Results</a></li>
              <li><a href="#partners" className="nav-link">Partners</a></li>
            </ul>

            <button className="nav-cta-btn" onClick={() => setIsConsoleOpen(true)}>
              Launch Console ↗
            </button>
          </header>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="section-dark" id="platform" style={{ paddingTop: "20px" }}>
        <div className="site-container">
          <div className="hero-wrapper">
            {/* Spark Accents */}
            <div className="hero-spark-container">
              <span className="hero-spark">✦</span>
              <span className="hero-spark small">✦</span>
            </div>

            {/* Hero Left Content */}
            <div>
              <h1 className="hero-headline">
                SECURE YOUR
                <br />
                DATA FUTURE
              </h1>

              <p className="hero-subtext">
                The most advanced local-first autonomous data scientist with verifiable execution for developers, machines, and humans.
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
                <div className="user-count-text">95K+ Active Users</div>
                <div className="avatar-stack">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="User 1"
                    className="stack-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="User 2"
                    className="stack-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                    alt="User 3"
                    className="stack-avatar"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="User 4"
                    className="stack-avatar"
                  />
                </div>
              </div>
            </div>

            {/* Hero Right Visual: 3D Smart Cards & Step Pathway */}
            <div className="hero-visual-container">
              <div className="card-3d-stack">
                {/* Top Orange 3D Card */}
                <div className="smart-card orange-top">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="card-brand-name">svajna</span>
                    <div className="card-chip"></div>
                  </div>
                  <div>
                    <div className="card-number">•••• •••• •••• 9842</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                      <span className="card-holder">Autonomous Agent</span>
                      <span style={{ fontSize: "11px", opacity: 0.8 }}>EXP 12/29</span>
                    </div>
                  </div>
                </div>

                {/* Silver Middle 3D Card */}
                <div className="smart-card silver-middle">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700 }}>DETERMINISTIC</span>
                    <span style={{ fontSize: "14px" }}>⚡</span>
                  </div>
                  <div className="card-number">•••• •••• •••• 7710</div>
                </div>

                {/* Black Bottom 3D Card */}
                <div className="smart-card black-bottom">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", opacity: 0.6 }}>IMMUTABLE AUDIT</span>
                  <div className="card-number">•••• •••• •••• 2026</div>
                </div>
              </div>

              {/* Step Guides on Far Right */}
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

      {/* 3. SECTION: GETTING TO KNOW SVAJNA (LIGHT SLATE) */}
      <section className="section-light" id="about">
        <div className="site-container">
          <div className="section-tag light-theme">// ABOUT US</div>
          <div className="section-header-split">
            <h2 className="section-title dark-text">
              GETTING TO
              <br />
              KNOW SVAJNA
            </h2>
            <p className="section-lead-desc">
              We are more than just a data science platform. We provide secure, verifiable, and bounded autonomous execution for developers and global teams.
            </p>
          </div>

          {/* 3 Bento Stat Cards */}
          <div className="bento-stats-grid">
            {/* Card 1: Orange 500k */}
            <div className="bento-stat-card orange">
              <div className="stat-icon-badge black-bg">↓</div>
              <div>
                <div className="bento-stat-val">
                  500k <span>users</span>
                </div>
                <p className="bento-stat-desc">
                  Empowering data scientists, engineers, and machine agents around the world with deterministic reproducibility.
                </p>
              </div>
            </div>

            {/* Card 2: Black 98% */}
            <div className="bento-stat-card black">
              <div className="stat-icon-badge orange-bg">✓</div>
              <div>
                <div className="bento-stat-val">
                  98<span>%</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#a1a1aa" }}>
                  Deterministic accuracy score across automated data validation and schema profiling benchmarks.
                </p>
              </div>
            </div>

            {/* Card 3: White 24K */}
            <div className="bento-stat-card white">
              <div className="stat-icon-badge orange-bg">★</div>
              <div>
                <div className="bento-stat-val">
                  24<span>K</span>
                </div>
                <p className="bento-stat-desc" style={{ color: "#71717a" }}>
                  Active autonomous pipelines executed and ML models tracked in local durable memory stores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: ALL-IN-ONE PLATFORM FOR DATA SCIENCE (LIGHT SLATE) */}
      <section className="section-light" id="features" style={{ paddingTop: "0" }}>
        <div className="site-container">
          <div className="section-tag light-theme">// FEATURES</div>
          <div className="section-header-split">
            <h2 className="section-title dark-text">
              ALL-IN-ONE PLATFORM
              <br />
              FOR DATA SCIENCE
            </h2>
            <p className="section-lead-desc">
              With SVAJNA, all your data sources, SQL engines, ML models, and audit logs are orchestrated securely in real time.
            </p>
          </div>

          <div className="features-split-layout">
            {/* Left: Accordion Items */}
            <div className="accordion-list">
              {accordionItems.map((item) => (
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

            {/* Right: Live Interactive Mockup Card */}
            <div className="mockup-display-card">
              <div className="mockup-header-dots">
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
              </div>

              <div className="mockup-title">Latest Execution Run: run_20260901_01</div>

              <div className="progress-bar-container">
                <div className="progress-segment orange" title="48% Profiling"></div>
                <div className="progress-segment black" title="28% ML Training"></div>
                <div className="progress-segment gray" title="24% Validation"></div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#71717a", marginBottom: "20px" }}>
                <span>• 48% Ingestion & Profiling</span>
                <span>• 28% Model Fitting</span>
                <span>• 24% Quality Audit</span>
              </div>

              <div className="mockup-row-item">
                <div className="mockup-user-info">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                    alt="Rory"
                    className="mockup-user-avatar"
                  />
                  <div>
                    <div className="mockup-user-name">Rory Williams</div>
                    <div className="mockup-user-date">sales_pipeline.csv • 12,500 rows</div>
                  </div>
                </div>
                <span className="mockup-badge orange">100/100 Quality</span>
              </div>

              <div className="mockup-row-item">
                <div className="mockup-user-info">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="John"
                    className="mockup-user-avatar"
                  />
                  <div>
                    <div className="mockup-user-name">John Terry</div>
                    <div className="mockup-user-date">user_churn.json • 54,000 rows</div>
                  </div>
                </div>
                <span className="mockup-badge orange">OLS Regressed</span>
              </div>

              <div className="mockup-row-item" style={{ borderBottom: "none" }}>
                <div className="mockup-user-info">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
                    alt="Sarah"
                    className="mockup-user-avatar"
                  />
                  <div>
                    <div className="mockup-user-name">Sarah Jane</div>
                    <div className="mockup-user-date">sensor_drift.parquet • 120,000 rows</div>
                  </div>
                </div>
                <span className="mockup-badge dark">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: MULTI-SOURCE CONNECTORS & 3D DUAL CARDS */}
      <section className="section-light" style={{ paddingTop: "40px", paddingBottom: "100px" }}>
        <div className="site-container">
          <div className="dual-card-showcase-grid">
            {/* Left: Dual 3D Smart Cards Graphic */}
            <div className="dual-cards-graphic">
              {/* Back Black Card */}
              <div className="showcase-vertical-card back-black">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>VISA</span>
                  <div className="card-chip" style={{ width: "24px", height: "18px" }}></div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", opacity: 0.6 }}>AUDIT PROOF</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>•••• 5521</div>
                </div>
              </div>

              {/* Front Orange Card */}
              <div className="showcase-vertical-card front-orange">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px" }}>svajna</span>
                  <div className="card-chip" style={{ width: "26px", height: "20px" }}></div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700 }}>Ralph Edwards</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", opacity: 0.9 }}>•••• 9842</div>
                </div>
              </div>
            </div>

            {/* Right: Connector Features & Benefits */}
            <div>
              <div className="section-tag light-theme">// INTEGRATIONS</div>
              <h2 className="section-title dark-text" style={{ fontSize: "38px" }}>
                MULTI-SOURCE DATA
                <br />
                CONNECTORS & DRIFT
              </h2>

              <div className="benefit-bullet-list">
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Zero-friction integration</strong> with PostgreSQL, SQLite, Snowflake, CSV, and formatted JSON streams.
                  </p>
                </div>
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Automated schema migration detection</strong> that flags breaking column deletions or type conversions.
                  </p>
                </div>
                <div className="benefit-bullet-item">
                  <div className="benefit-bullet-icon">✓</div>
                  <p className="benefit-bullet-text">
                    <strong>Immutable cryptographic audit trail</strong> connecting every model and conclusion to verifiable source data.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button className="btn-orange-pill" onClick={() => setIsConsoleOpen(true)}>
                  Explore Connectors
                </button>
                <button className="btn-circle-arrow" onClick={() => setIsConsoleOpen(true)}>
                  ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: REAL-TIME DATA ENGINE MONITORING (PITCH BLACK) */}
      <section className="section-dark" id="results">
        <div className="site-container">
          <div className="section-tag dark-theme">// REAL-TIME ENGINE</div>
          <div className="section-header-split">
            <h2 className="section-title white-text">
              REAL-TIME ANOMALY &
              <br />
              DRIFT MONITORING
            </h2>
            <p className="section-lead-desc white-theme">
              Monitoring every dataset transaction, distribution drift, and pipeline execution in real time with bounded autonomy.
            </p>
          </div>

          <div className="realtime-bento-layout">
            {/* Left: 98% Rating Card */}
            <div className="realtime-stat-box">
              <div className="stat-icon-badge orange-bg">★</div>
              <div>
                <div className="bento-stat-val" style={{ color: "#fff" }}>
                  98<span>%</span>
                </div>
                <p style={{ fontSize: "14px", color: "#a1a1aa", marginTop: "12px", lineHeight: "1.6" }}>
                  Partners are highly satisfied with our automated profiling, statistical metrics, and quality score alerts.
                </p>
              </div>
            </div>

            {/* Right: 4 Orange Integration Bento Tiles */}
            <div className="ecosystem-tiles-grid">
              <div className="ecosystem-orange-tile"> Apple Pay</div>
              <div className="ecosystem-orange-tile">PayPal</div>
              <div className="ecosystem-orange-tile">Wise</div>
              <div className="ecosystem-orange-tile">G Pay</div>

              {/* Bottom CTA Banner */}
              <div className="ecosystem-cta-banner">
                <div className="ecosystem-cta-title">
                  CREATING IMPACTFUL WORKFLOWS & PARTNERSHIPS
                </div>
                <button className="btn-orange-pill" onClick={() => setIsConsoleOpen(true)}>
                  LET'S GET STARTED
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: TESTIMONIAL QUOTE (LIGHT SLATE) */}
      <section className="section-light">
        <div className="site-container">
          <div className="section-tag light-theme">// TESTIMONIALS</div>

          <div className="testimonial-card-wrapper">
            <span className="testimonial-quote-icon">”</span>
            <p className="testimonial-text">
              “{testimonials[testimonialIndex]?.quote}”
            </p>

            <div className="testimonial-author-row">
              <div className="author-profile">
                <img
                  src={testimonials[testimonialIndex]?.avatar}
                  alt={testimonials[testimonialIndex]?.author}
                  className="author-avatar"
                />
                <div>
                  <div className="author-name">{testimonials[testimonialIndex]?.author}</div>
                  <div className="author-role">{testimonials[testimonialIndex]?.role}</div>
                </div>
              </div>

              <div className="carousel-nav-buttons">
                <button
                  className="carousel-arrow-btn"
                  onClick={() =>
                    setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                  }
                >
                  ←
                </button>
                <button
                  className="carousel-arrow-btn"
                  onClick={() =>
                    setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. GIANT 3D EMBOSSED WORDMARK */}
      <div className="giant-3d-wordmark-container">
        <div className="giant-3d-wordmark">svajna</div>
      </div>

      {/* 9. VIBRANT ORANGE FOOTER */}
      <footer className="vibrant-orange-footer" id="partners">
        <div className="site-container">
          <div className="footer-top-grid">
            <div>
              <div style={{ display: "flex", gap: "10px", fontSize: "16px", marginBottom: "8px" }}>
                <span>f</span> <span>tw</span> <span>ig</span> <span>in</span>
              </div>
              <h3 className="footer-cta-headline">
                READY TO TAKE
                <br />
                CONTROL OF YOUR
                <br />
                DATA FUTURE
              </h3>
              <button className="btn-white-pill" onClick={() => setIsConsoleOpen(true)}>
                GET STARTED
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
              <div className="footer-col-title">Company</div>
              <ul className="footer-col-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Resources</div>
              <ul className="footer-col-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Changelog</a></li>
                <li><a href="#">MCP Protocol</a></li>
                <li><a href="#">Releases</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-col-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Status</a></li>
                <li><a href="#">API Keys</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>© 2026 SVAJNA Inc. All Rights Reserved.</div>
            <div style={{ display: "flex", gap: "24px" }}>
              <a href="#" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Terms of Service</a>
              <a href="#" style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 10. INTERACTIVE CONSOLE MODAL / WORKBENCH */}
      {isConsoleOpen && (
        <div className="modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="brand-icon-box" style={{ width: "28px", height: "28px", fontSize: "14px" }}>✦</div>
                <h3 style={{ fontSize: "18px", fontWeight: 800 }}>SVAJNA Advanced Data Science Console</h3>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setConsoleTab("profiler")}
                style={{
                  background: consoleTab === "profiler" ? "var(--orange-primary)" : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Dataset Profiler
              </button>
              <button
                onClick={() => setConsoleTab("ml")}
                style={{
                  background: consoleTab === "ml" ? "var(--orange-primary)" : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ML Model Studio
              </button>
              <button
                onClick={() => setConsoleTab("diff")}
                style={{
                  background: consoleTab === "diff" ? "var(--orange-primary)" : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Row Diff Engine
              </button>
              <button
                onClick={() => setConsoleTab("export")}
                style={{
                  background: consoleTab === "export" ? "var(--orange-primary)" : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Import / Export
              </button>
            </div>

            <div className="modal-body">
              {consoleTab === "profiler" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Dataset Profile Overview</h4>
                      <p style={{ fontSize: "13px", color: "#94a3b8" }}>Source: production_data.json ({profile.rowCount} rows)</p>
                    </div>
                    <span style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "6px 14px", borderRadius: "12px", fontWeight: 700, fontSize: "14px" }}>
                      Quality: {profile.score}/100
                    </span>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                        <th style={{ padding: "8px" }}>Column</th>
                        <th style={{ padding: "8px" }}>Kind</th>
                        <th style={{ padding: "8px" }}>Present</th>
                        <th style={{ padding: "8px" }}>Distinct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.columns.map((c) => (
                        <tr key={c.name} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "8px", fontWeight: 600, color: "#38bdf8" }}>{c.name}</td>
                          <td style={{ padding: "8px" }}>{c.kind}</td>
                          <td style={{ padding: "8px" }}>{c.present}</td>
                          <td style={{ padding: "8px" }}>{c.distinct}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {consoleTab === "ml" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>OLS Linear Regression Model</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>SLOPE (M)</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--orange-primary)" }}>{regModel.slope}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>INTERCEPT (B)</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#38bdf8" }}>{regModel.intercept}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>R² SCORE</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#4ade80" }}>{metrics.r2}</div>
                    </div>
                    <div style={{ background: "#16161c", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>RMSE</div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "#4ade80" }}>{metrics.rmse}</div>
                    </div>
                  </div>
                </div>
              )}

              {consoleTab === "diff" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Row-Level Diffing (V1 vs V2)</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: "6px" }}>+ Added ({diff.added.length})</div>
                      {diff.added.map((r) => (
                        <div key={r.id}>{r.name} ({r.role})</div>
                      ))}
                    </div>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "6px" }}>- Removed ({diff.removed.length})</div>
                      {diff.removed.map((r) => (
                        <div key={r.id}>{r.name} ({r.role})</div>
                      ))}
                    </div>
                    <div style={{ background: "#16161c", padding: "14px", borderRadius: "12px" }}>
                      <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "6px" }}>~ Modified ({diff.modified.length})</div>
                      {diff.modified.map((m, idx) => (
                        <div key={idx}>{m.before.name} → {m.after.role}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {consoleTab === "export" && (
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}>Export Dataset Engine</h4>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                    <button
                      className="btn-orange-pill"
                      style={{ padding: "8px 16px", fontSize: "12px" }}
                      onClick={() => alert(exportDataset(sampleTeamV1, { format: "csv" }))}
                    >
                      Export CSV
                    </button>
                    <button
                      className="btn-orange-pill"
                      style={{ background: "#22c55e", padding: "8px 16px", fontSize: "12px" }}
                      onClick={() => alert(exportDataset(sampleTeamV1, { format: "json" }))}
                    >
                      Export JSON
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
