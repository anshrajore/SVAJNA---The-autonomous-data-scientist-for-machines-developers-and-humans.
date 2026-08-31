import React, { useState } from "react";
import { profileDataset, diffRows } from "../utils/browser-analysis";

const SAMPLE_TEAM_V1 = [
  { id: "1", name: "Alice", role: "Data Scientist", salary: 120000 },
  { id: "2", name: "Bob", role: "Software Engineer", salary: 110000 },
  { id: "3", name: "Charlie", role: "Product Designer", salary: 105000 },
];

const SAMPLE_TEAM_V2 = [
  { id: "1", name: "Alice", role: "Lead Data Scientist", salary: 135000 },
  { id: "2", name: "Bob", role: "Software Engineer", salary: 110000 },
  { id: "4", name: "David", role: "ML Engineer", salary: 130000 },
];

export const PlaygroundPage: React.FC = () => {
  const [datasetChoice, setDatasetChoice] = useState<"v1" | "v2">("v1");
  const currentRows = datasetChoice === "v1" ? SAMPLE_TEAM_V1 : SAMPLE_TEAM_V2;
  const profile = profileDataset(`sample_team_${datasetChoice}.json`, currentRows);
  const diff = diffRows(SAMPLE_TEAM_V1, SAMPLE_TEAM_V2, "id");

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "48px", marginBottom: "16px" }}>
        Live Interactive Data Workbench
      </h1>
      <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "36px" }}>
        Upload or profile dataset versions in real-time, view quality findings, and execute row-level diffing.
      </p>

      {/* Dataset Selection */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
        <button
          onClick={() => setDatasetChoice("v1")}
          style={{
            background: datasetChoice === "v1" ? "#09090b" : "#fff",
            color: datasetChoice === "v1" ? "#fff" : "#09090b",
            padding: "10px 20px",
            borderRadius: "20px",
            fontWeight: 600,
            fontSize: "14px",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          Sample Dataset V1 (Original)
        </button>
        <button
          onClick={() => setDatasetChoice("v2")}
          style={{
            background: datasetChoice === "v2" ? "#09090b" : "#fff",
            color: datasetChoice === "v2" ? "#fff" : "#09090b",
            padding: "10px 20px",
            borderRadius: "20px",
            fontWeight: 600,
            fontSize: "14px",
            border: "1px solid rgba(0,0,0,0.1)",
          }}
        >
          Sample Dataset V2 (Promotions & Additions)
        </button>
      </div>

      {/* Quality Overview Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          marginBottom: "36px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Dataset Profile Overview</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Source: sample_team_{datasetChoice}.json</p>
          </div>
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Quality Score: {profile.score}/100
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700 }}>{profile.rowCount}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Rows</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700 }}>{profile.columns.length}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Columns Identified</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700 }}>0</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Null / Missing Values</div>
          </div>
        </div>

        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Column Metadata</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Column Name</th>
              <th style={{ padding: "8px" }}>Kind</th>
              <th style={{ padding: "8px" }}>Present</th>
              <th style={{ padding: "8px" }}>Distinct</th>
            </tr>
          </thead>
          <tbody>
            {profile.columns.map((col) => (
              <tr key={col.name} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{col.name}</td>
                <td style={{ padding: "8px" }}>{col.kind}</td>
                <td style={{ padding: "8px" }}>{col.present}</td>
                <td style={{ padding: "8px" }}>{col.distinct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row-Level Data Diff Engine Demonstration */}
      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Row-Level Diff Engine (V1 vs V2)</h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
          Comparing datasets keyed by column <code>id</code>
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
          <div style={{ background: "#1e293b", padding: "16px", borderRadius: "12px" }}>
            <div style={{ color: "#4ade80", fontWeight: 700, marginBottom: "8px" }}>+ Added Rows ({diff.added.length})</div>
            {diff.added.map((row) => (
              <div key={String(row.id)}>
                {row.name} ({row.role})
              </div>
            ))}
          </div>

          <div style={{ background: "#1e293b", padding: "16px", borderRadius: "12px" }}>
            <div style={{ color: "#f87171", fontWeight: 700, marginBottom: "8px" }}>- Removed Rows ({diff.removed.length})</div>
            {diff.removed.map((row) => (
              <div key={String(row.id)}>
                {row.name} ({row.role})
              </div>
            ))}
          </div>

          <div style={{ background: "#1e293b", padding: "16px", borderRadius: "12px" }}>
            <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: "8px" }}>~ Modified Rows ({diff.modified.length})</div>
            {diff.modified.map((m, i) => (
              <div key={i}>
                {m.before.name} → {m.after.role}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
