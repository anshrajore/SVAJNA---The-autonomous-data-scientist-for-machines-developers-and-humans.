import React from "react";

export const DocsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "48px", marginBottom: "16px" }}>
        CLI & Architecture Documentation
      </h1>
      <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "40px", lineHeight: 1.6 }}>
        Step-by-step CLI usage guide, autonomy control matrix, and deterministic flow architecture.
      </p>

      {/* CLI Commands Breakdown */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>Command Reference</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            { cmd: "svajna init", desc: "Initializes local `.svajna/` state directory with runs/ and reports/ folders." },
            { cmd: "svajna analyze <file.csv|file.json>", desc: "Profiles dataset deterministically, calculates quality score (0–100), and records run events." },
            { cmd: "svajna pipeline <file.csv|file.json>", desc: "Executes multi-step pipeline (profile → validate → report) on target dataset." },
            { cmd: "svajna report", desc: "Prints path to latest generated Markdown analysis report under `.svajna/reports/`." },
            { cmd: "svajna status", desc: "Displays project config, autonomy level (0–6), monitoring state, and latest run ID." },
          ].map((item) => (
            <div
              key={item.cmd}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <code
                style={{
                  background: "#09090b",
                  color: "#4ade80",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              >
                {item.cmd}
              </code>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "10px" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Autonomy Level Table */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>Autonomy Level Matrix (0–6)</h2>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "10px" }}>Level</th>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Permitted Capabilities</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px", fontWeight: 700 }}>0</td>
                <td style={{ padding: "10px" }}>Read-Only</td>
                <td style={{ padding: "10px" }}>Data profiling & read queries</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px", fontWeight: 700 }}>1 (Default)</td>
                <td style={{ padding: "10px" }}>Artifact Writing</td>
                <td style={{ padding: "10px" }}>Local reports & event logs under `.svajna/`</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px", fontWeight: 700 }}>5+</td>
                <td style={{ padding: "10px" }}>High Impact</td>
                <td style={{ padding: "10px" }}>Requires explicit approval prompt before execution</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
