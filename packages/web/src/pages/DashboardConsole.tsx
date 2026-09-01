import React from "react";

export const DashboardConsole: React.FC = () => {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Data Science Console</h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Verifiable local analytical run state & dataset metrics</p>
        </div>
        <button className="btn-primary">+ New Analysis Run</button>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-lbl">Active Datasets</div>
          <div className="stat-val">12</div>
        </div>
        <div className="stat-box">
          <div className="stat-lbl">Quality Score Avg</div>
          <div className="stat-val" style={{ color: "#4ade80" }}>98.4%</div>
        </div>
        <div className="stat-box">
          <div className="stat-lbl">ML Models Trained</div>
          <div className="stat-val">8</div>
        </div>
        <div className="stat-box">
          <div className="stat-lbl">Durable Event Logs</div>
          <div className="stat-val">1,420</div>
        </div>
      </div>

      {/* Recent Runs Table */}
      <div className="card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Recent Analytical Runs</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
              <th style={{ padding: "12px" }}>Run ID</th>
              <th style={{ padding: "12px" }}>Dataset</th>
              <th style={{ padding: "12px" }}>Rows</th>
              <th style={{ padding: "12px" }}>Quality Score</th>
              <th style={{ padding: "12px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "run_20260901_01", ds: "sales_q3.csv", rows: "12,500", score: "100/100", status: "Completed" },
              { id: "run_20260901_02", ds: "user_churn.json", rows: "54,000", score: "96/100", status: "Completed" },
              { id: "run_20260901_03", ds: "sensor_telemetry.csv", rows: "120,000", score: "92/100", status: "Drift Flagged" },
            ].map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "12px", fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{r.id}</td>
                <td style={{ padding: "12px" }}>{r.ds}</td>
                <td style={{ padding: "12px" }}>{r.rows}</td>
                <td style={{ padding: "12px", color: "#4ade80", fontWeight: 600 }}>{r.score}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: r.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: r.status === "Completed" ? "#4ade80" : "#fbbf24", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
