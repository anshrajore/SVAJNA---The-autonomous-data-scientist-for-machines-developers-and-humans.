import React, { useState } from "react";
import { exportDataset } from "../utils/browser-analysis";

export const ImportExportStudio: React.FC = () => {
  const [exportedData, setExportedData] = useState("");

  const sampleData = [
    { id: 1, name: "Alice", role: "Data Scientist", salary: 120000 },
    { id: 2, name: "Bob", role: "Software Engineer", salary: 110000 },
  ];

  const handleExportCsv = () => {
    const csv = exportDataset(sampleData, { format: "csv" });
    setExportedData(csv);
  };

  const handleExportJson = () => {
    const json = exportDataset(sampleData, { format: "json" });
    setExportedData(json);
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Data Import & Export Studio</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Import raw files, run ETL transformations, and export to CSV/JSON</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Export Dataset Format</h2>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button className="btn-primary" onClick={handleExportCsv}>Export as CSV</button>
          <button className="btn-primary" style={{ background: "#10b981" }} onClick={handleExportJson}>Export as JSON</button>
        </div>

        {exportedData && (
          <div style={{ background: "#090a0f", padding: "16px", borderRadius: "12px", fontFamily: "var(--font-mono)", fontSize: "13px", color: "#38bdf8", whiteSpace: "pre-wrap" }}>
            {exportedData}
          </div>
        )}
      </div>
    </div>
  );
};
