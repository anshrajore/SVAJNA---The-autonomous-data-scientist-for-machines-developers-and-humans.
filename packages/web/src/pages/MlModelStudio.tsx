import React, { useState } from "react";
import { trainSimpleLinearRegression, calculateRegressionMetrics } from "../utils/browser-analysis";

export const MlModelStudio: React.FC = () => {
  const [modelType, setModelType] = useState<"regression" | "knn">("regression");

  // Sample data
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

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Machine Learning Studio</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>Train, evaluate, and inspect deterministic ML models</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setModelType("regression")}
          style={{
            background: modelType === "regression" ? "#3b82f6" : "#1e293b",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          OLS Linear Regression
        </button>
        <button
          onClick={() => setModelType("knn")}
          style={{
            background: modelType === "knn" ? "#3b82f6" : "#1e293b",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          KNN Classifier
        </button>
      </div>

      {modelType === "regression" ? (
        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>OLS Linear Regression Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "#0f172a", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>SLOPE (M)</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#38bdf8" }}>{regModel.slope}</div>
            </div>
            <div style={{ background: "#0f172a", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>INTERCEPT (B)</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#38bdf8" }}>{regModel.intercept}</div>
            </div>
            <div style={{ background: "#0f172a", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>R² SCORE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#4ade80" }}>{metrics.r2}</div>
            </div>
            <div style={{ background: "#0f172a", padding: "16px", borderRadius: "12px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>RMSE</div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#4ade80" }}>{metrics.rmse}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>K-Nearest Neighbors Classifier</h2>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>Classification model initialized with K=3 nearest Euclidean distance neighbors.</p>
        </div>
      )}
    </div>
  );
};
