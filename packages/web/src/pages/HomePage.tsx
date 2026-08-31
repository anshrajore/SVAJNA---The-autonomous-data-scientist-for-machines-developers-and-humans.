import React, { useState } from "react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [terminalCmd, setTerminalCmd] = useState("svajna analyze ./sales.csv");
  const [terminalOutput, setTerminalOutput] = useState(`Analysis complete: run_20260831_i6q5lp
Rows: 5,000 | Columns: 18
Quality Score: 100/100
Report generated: .svajna/reports/run_20260831_i6q5lp.md`);

  const handleCommand = (cmd: string) => {
    setTerminalCmd(cmd);
    if (cmd.includes("pipeline")) {
      setTerminalOutput(`Pipeline executed: pipe_1788143704193
Source: ./data/sales.csv
Steps completed: profile, validate, report
Quality score: 100/100 (Clean Data)`);
    } else if (cmd.includes("status")) {
      setTerminalOutput(`Project: SVAJNA project
Autonomy Level: 1 (Bounded Autonomy)
Monitoring: Enabled (High Sensitivity)
Latest run: run_20260831_i6q5lp`);
    } else {
      setTerminalOutput(`Analysis complete: run_20260831_i6q5lp
Rows: 5,000 | Columns: 18
Quality Score: 100/100
Report generated: .svajna/reports/run_20260831_i6q5lp.md`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ textAlign: "center", maxWidth: "920px", margin: "0 auto 70px auto" }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "80px",
          lineHeight: 1.1,
          fontWeight: 400,
          marginBottom: "24px",
          letterSpacing: "-1.5px"
        }}>
          SVAJNA{" "}
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 6px",
            border: "3px solid #fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            transform: "translateY(-4px)"
          }} alt="AI Agent" />
          is an Autonomous{" "}
          <br />
          Data Scientist{" "}
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80" style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 6px",
            border: "3px solid #fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            transform: "translateY(-4px)"
          }} alt="Data Science" />
          for Machines{" "}
          <br />
          Developers & Humans{" "}
          <img src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=100&auto=format&fit=crop&q=80" style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 6px",
            border: "3px solid #fff",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            transform: "translateY(-4px)"
          }} alt="Verification" />
        </h1>

        <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "540px", margin: "0 auto 36px auto", lineHeight: 1.6 }}>
          Local-first data science operating system with bounded autonomy, deterministic evidence, verifiable profiling, and persistent memory.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <button onClick={() => onNavigate("playground")} style={{
            background: "#09090b",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
          }}>
            Launch Data Workbench ↗
          </button>
          <button onClick={() => onNavigate("docs")} style={{
            background: "#fff",
            color: "var(--text-main)",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: 600,
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}>
            CLI Documentation
          </button>
        </div>
      </section>

      {/* Dual Showcase Split Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", marginBottom: "60px" }}>
        <div style={{
          background: "var(--card-dark)",
          borderRadius: "24px",
          padding: "32px",
          color: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
          <div style={{
            background: "#1e293b",
            borderRadius: "16px",
            height: "180px",
            marginBottom: "24px",
            padding: "20px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "#38bdf8"
          }}>
            <div><span style={{ color: "#4ade80" }}>✔</span> Deterministic Profiling</div>
            <div><span style={{ color: "#4ade80" }}>✔</span> Null & Cardinality Detection</div>
            <div><span style={{ color: "#4ade80" }}>✔</span> Durable Event Stream Persistence</div>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Deterministic Profiling Engine</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.5 }}>Extracts schema metadata, null ratios, cardinality, and anomaly risks without modifying raw datasets.</p>
        </div>

        <div style={{
          background: "var(--card-dark)",
          borderRadius: "24px",
          padding: "32px",
          color: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
        }}>
          <div style={{
            background: "radial-gradient(circle at 90% 10%, #3b82f6 0%, #0f172a 75%)",
            borderRadius: "16px",
            height: "180px",
            marginBottom: "24px",
            padding: "20px",
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "#93c5fd"
          }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>MCP Stdio Server</div>
            <div>svajna://capabilities</div>
            <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "8px" }}>Tools: data_profile, analysis_execute, pipeline_execute, memory_read</div>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Model Context Protocol (MCP)</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.5 }}>Exposes project-bounded tools to AI models like Claude and Antigravity with strict safety barriers.</p>
        </div>
      </section>

      {/* Interactive CLI Terminal Simulator */}
      <section style={{
        background: "#090a0f",
        borderRadius: "24px",
        padding: "32px",
        color: "#f8fafc",
        fontFamily: "var(--font-mono)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
        marginBottom: "60px"
      }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f87171" }}></div>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }}></div>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#34d399" }}></div>
        </div>

        <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
          {["svajna analyze ./sales.csv", "svajna pipeline ./sales.csv", "svajna status"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              style={{
                background: terminalCmd === cmd ? "#2563eb" : "#1e293b",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)"
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "14px", marginBottom: "8px" }}>
          <span style={{ color: "#4ade80" }}>svajna@local:~$</span> <span style={{ color: "#f43f5e", fontWeight: 600 }}>{terminalCmd}</span>
        </div>
        <pre style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{terminalOutput}</pre>
      </section>
    </div>
  );
};
