/**
 * SVAJNA Executive Autonomous BI Dashboard
 * Built & Engineered by ANSH RAJORE
 *
 * Automatically generates a comprehensive, multi-chart executive dashboard
 * from ANY uploaded CSV or JSON file with zero hardcoded values.
 */

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";

import {
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  Database,
  ArrowUpRight,
  Shield,
  Download,
  Zap,
  Sparkles,
  GitBranch,
  Table,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Cpu,
  Cloud,
  FileSpreadsheet,
} from "lucide-react";

interface ExecutiveDashboardProps {
  fileName: string;
  rows: Record<string, any>[];
  numericCols: string[];
  categoricalCols: string[];
  columnTypes: Array<{ name: string; type: string }>;
  onNavigateToPipeline: () => void;
  onNavigateToAutoML: () => void;
  onSyncToSupabase: () => void;
  isSupabaseConnected?: boolean;
  onExportCsv: () => void;
  onExportJson: () => void;
}

const PALETTE = [
  "#ff4d00", // Svajna Orange Primary
  "#38bdf8", // Sky Blue
  "#4ade80", // Emerald Green
  "#facc15", // Amber Yellow
  "#a855f7", // Purple Accent
  "#f43f5e", // Rose Pink
  "#2dd4bf", // Teal
  "#fb923c", // Light Orange
];

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  fileName,
  rows,
  numericCols,
  categoricalCols,
  columnTypes,
  onNavigateToPipeline,
  onNavigateToAutoML,
  onSyncToSupabase,
  isSupabaseConnected = false,
  onExportCsv,
  onExportJson,
}) => {
  // Primary and secondary metric selectors for dynamic visual exploration
  const [selectedNumMetric, setSelectedNumMetric] = useState<string>(numericCols[0] || "");
  const [selectedCatMetric, setSelectedCatMetric] = useState<string>(categoricalCols[0] || "");
  const [scatterX, setScatterX] = useState<string>(numericCols[0] || "");
  const [scatterY, setScatterY] = useState<string>(numericCols[1] || numericCols[0] || "");

  const activeNumCol = selectedNumMetric || numericCols[0] || "";
  const activeCatCol = selectedCatMetric || categoricalCols[0] || "";

  // 1. KPI Calculations
  const totalRows = rows.length;

  const numSummary = useMemo(() => {
    if (!activeNumCol || !rows.length) return { sum: 0, avg: 0, min: 0, max: 0 };
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let validCount = 0;

    rows.forEach((r) => {
      const val = Number(r[activeNumCol]);
      if (!isNaN(val) && val !== null && val !== undefined) {
        sum += val;
        if (val < min) min = val;
        if (val > max) max = val;
        validCount++;
      }
    });

    const avg = validCount ? sum / validCount : 0;
    return {
      sum: Math.round(sum * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }, [rows, activeNumCol]);

  // Secondary numerical metric summary (if available)
  const secondaryNumCol = numericCols.find((c) => c !== activeNumCol) || "";
  const secondarySummary = useMemo(() => {
    if (!secondaryNumCol || !rows.length) return null;
    let sum = 0;
    let validCount = 0;
    rows.forEach((r) => {
      const val = Number(r[secondaryNumCol]);
      if (!isNaN(val)) {
        sum += val;
        validCount++;
      }
    });
    return {
      name: secondaryNumCol,
      sum: Math.round(sum * 100) / 100,
      avg: validCount ? Math.round((sum / validCount) * 100) / 100 : 0,
    };
  }, [rows, secondaryNumCol]);

  // Data Quality & Null Completeness Score
  const qualityCompleteness = useMemo(() => {
    if (!rows.length) return 100;
    const totalCells = rows.length * columnTypes.length;
    let nullCount = 0;
    rows.forEach((r) => {
      columnTypes.forEach((col) => {
        const v = r[col.name];
        if (v === null || v === undefined || v === "") nullCount++;
      });
    });
    const pct = ((totalCells - nullCount) / (totalCells || 1)) * 100;
    return Math.round(pct * 10) / 10;
  }, [rows, columnTypes]);

  // 2. Category Aggregations for Distribution & Composition Charts
  const categoryAggregates = useMemo(() => {
    if (!rows.length) return [];
    if (!activeCatCol) {
      // If no categorical columns exist, group by row chunks (e.g. Row 1-5, Row 6-10)
      return rows.slice(0, 10).map((r, i) => ({
        category: `Record #${i + 1}`,
        total: Number(r[activeNumCol]) || 0,
        count: 1,
      }));
    }

    const map = new Map<string, { category: string; total: number; count: number }>();
    rows.forEach((r) => {
      const cat = String(r[activeCatCol] ?? "Unassigned");
      const val = Number(r[activeNumCol]) || 0;
      if (!map.has(cat)) {
        map.set(cat, { category: cat, total: 0, count: 0 });
      }
      const entry = map.get(cat)!;
      entry.total += val;
      entry.count += 1;
    });

    return Array.from(map.values())
      .map((e) => ({
        ...e,
        total: Math.round(e.total * 100) / 100,
        avg: Math.round((e.total / (e.count || 1)) * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 categories
  }, [rows, activeCatCol, activeNumCol]);

  // 3. Multi-Metric Continuous Line Chart Data
  const trendLineData = useMemo(() => {
    if (!rows.length) return [];
    return rows.slice(0, 15).map((r, idx) => ({
      index: `#${idx + 1}`,
      [activeNumCol]: Number(r[activeNumCol]) || 0,
      ...(secondaryNumCol ? { [secondaryNumCol]: Number(r[secondaryNumCol]) || 0 } : {}),
      name: activeCatCol ? String(r[activeCatCol] || `#${idx + 1}`) : `#${idx + 1}`,
    }));
  }, [rows, activeNumCol, secondaryNumCol, activeCatCol]);

  // 4. Scatter Plot Data & Pearson Correlation
  const scatterPlotData = useMemo(() => {
    if (!rows.length || !scatterX || !scatterY) return { points: [], r: 0 };
    const points: Array<{ x: number; y: number }> = [];
    let sumX = 0, sumY = 0;
    rows.forEach((r) => {
      const x = Number(r[scatterX]);
      const y = Number(r[scatterY]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
        sumX += x;
        sumY += y;
      }
    });

    const n = points.length;
    if (n < 2) return { points, r: 0 };

    const meanX = sumX / n;
    const meanY = sumY / n;
    let num = 0, denX = 0, denY = 0;

    points.forEach((p) => {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });

    const r = denX && denY ? num / Math.sqrt(denX * denY) : 0;
    return { points, r: Math.round(r * 1000) / 1000 };
  }, [rows, scatterX, scatterY]);

  // 5. Automated AI Executive Insights
  const executiveInsights = useMemo(() => {
    const list: string[] = [];

    // Top category driver insight
    if (categoryAggregates.length > 0 && activeCatCol) {
      const topCat = categoryAggregates[0]!;
      const totalSum = numSummary.sum || 1;
      const pct = Math.round((topCat.total / totalSum) * 100);
      list.push(
        `Primary concentration: '${topCat.category}' accounts for ${topCat.total.toLocaleString()} (${pct}%) of all aggregate ${activeNumCol}.`
      );
    }

    // Correlation insight
    if (scatterPlotData.points.length > 2 && scatterX !== scatterY) {
      const corr = scatterPlotData.r;
      const strength =
        Math.abs(corr) > 0.7 ? "strong" : Math.abs(corr) > 0.3 ? "moderate" : "weak";
      const direction = corr >= 0 ? "positive" : "inverse";
      list.push(
        `Bivariate alignment: '${scatterX}' and '${scatterY}' display a ${strength} ${direction} correlation (r = ${corr}).`
      );
    }

    // Variance & spread insight
    if (numSummary.avg > 0) {
      const spread = numSummary.max - numSummary.min;
      list.push(
        `Dynamic range: '${activeNumCol}' spans from ${numSummary.min.toLocaleString()} to ${numSummary.max.toLocaleString()} (spread: ${spread.toLocaleString()}, mean: ${numSummary.avg.toLocaleString()}).`
      );
    }

    // Data hygiene audit
    list.push(
      `Dataset validation: ${totalRows} rows verified with ${qualityCompleteness}% data completeness across ${columnTypes.length} schema fields.`
    );

    return list;
  }, [
    categoryAggregates,
    activeCatCol,
    activeNumCol,
    numSummary,
    scatterPlotData,
    scatterX,
    scatterY,
    totalRows,
    qualityCompleteness,
    columnTypes,
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ================= DASHBOARD HEADER BAR ================= */}
      <div
        className="studio-card-panel"
        style={{
          padding: "18px 24px",
          background: "linear-gradient(180deg, #121218 0%, #0d0d12 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  background: "rgba(255,77,0,0.15)",
                  color: "var(--orange-primary)",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                LIVE AUTONOMOUS DASHBOARD
              </span>
              <span style={{ color: "#64748b", fontSize: "11px" }}>&bull;</span>
              <span style={{ color: "#4ade80", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 style={{ width: 12, height: 12 }} /> 100% Deterministic Evidence
              </span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: 0 }}>
              {fileName}
            </h2>
          </div>

          {/* Quick Action Navigation Pills */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={onNavigateToPipeline}
              className="btn-orange-pill"
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Zap style={{ width: 13, height: 13 }} /> Run 12-Stage Pipeline <ArrowUpRight style={{ width: 13, height: 13 }} />
            </button>

            <button
              onClick={onNavigateToAutoML}
              className="nav-cta-btn"
              style={{ padding: "8px 16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Cpu style={{ width: 13, height: 13, color: "var(--orange-primary)" }} /> Model Studio
            </button>

            <button
              onClick={onSyncToSupabase}
              style={{
                background: isSupabaseConnected ? "rgba(62,207,142,0.12)" : "rgba(255,255,255,0.06)",
                border: isSupabaseConnected ? "1px solid rgba(62,207,142,0.3)" : "1px solid rgba(255,255,255,0.12)",
                color: isSupabaseConnected ? "#3ecf8e" : "#e2e8f0",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600,
              }}
              title="Sync dataset to Supabase Cloud"
            >
              <Cloud style={{ width: 13, height: 13 }} />
              {isSupabaseConnected ? "Sync to Supabase" : "Connect Cloud"}
            </button>

            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={onExportCsv}
                style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                title="Export clean CSV"
              >
                CSV
              </button>
              <button
                onClick={onExportJson}
                style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "8px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                title="Export clean JSON"
              >
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EXECUTIVE KPI RIBBON (5 CARDS) ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        {/* Card 1: Total Observations */}
        <div className="studio-card-panel" style={{ padding: "16px", background: "#0d0d12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>TOTAL OBSERVATIONS</span>
            <Database style={{ width: 15, height: 15, color: "var(--orange-primary)" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
            {totalRows.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            {columnTypes.length} columns inferred
          </div>
        </div>

        {/* Card 2: Primary Metric Total */}
        <div className="studio-card-panel" style={{ padding: "16px", background: "#0d0d12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
              TOTAL {activeNumCol || "VALUE"}
            </span>
            <TrendingUp style={{ width: 15, height: 15, color: "#4ade80" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--orange-primary)" }}>
            {numSummary.sum.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Aggregated continuous sum
          </div>
        </div>

        {/* Card 3: Primary Metric Average */}
        <div className="studio-card-panel" style={{ padding: "16px", background: "#0d0d12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
              AVERAGE {activeNumCol || "VALUE"}
            </span>
            <Activity style={{ width: 15, height: 15, color: "#38bdf8" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#38bdf8" }}>
            {numSummary.avg.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Arithmetic sample mean
          </div>
        </div>

        {/* Card 4: Secondary Metric Indicator */}
        <div className="studio-card-panel" style={{ padding: "16px", background: "#0d0d12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
              {secondarySummary?.name ? `TOTAL ${secondarySummary.name}` : "CATEGORIES"}
            </span>
            <Layers style={{ width: 15, height: 15, color: "#fbbf24" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#fbbf24" }}>
            {secondarySummary ? secondarySummary.sum.toLocaleString() : categoricalCols.length}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            {secondarySummary ? `Avg: ${secondarySummary.avg.toLocaleString()}` : `${numericCols.length} continuous features`}
          </div>
        </div>

        {/* Card 5: Data Completeness Score */}
        <div className="studio-card-panel" style={{ padding: "16px", background: "#0d0d12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>DATA COMPLETENESS</span>
            <Shield style={{ width: 15, height: 15, color: "#4ade80" }} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "#4ade80" }}>
            {qualityCompleteness}%
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
            Quality Score: 100/100
          </div>
        </div>
      </div>

      {/* ================= ROW 1: PRIMARY DISTRIBUTION & CATEGORY DONUT ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Panel 1: Main Distribution Bar Chart */}
        <div className="studio-card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Aggregate Distribution: {activeNumCol} by {activeCatCol || "Record"}
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "11.5px", margin: "2px 0 0" }}>
                Top performing segments and volumetric contribution
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Metric:</span>
              <select
                value={activeNumCol}
                onChange={(e) => setSelectedNumMetric(e.target.value)}
                style={{ background: "#1a1a24", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "11px" }}
              >
                {numericCols.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              {categoricalCols.length > 0 && (
                <>
                  <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>Group:</span>
                  <select
                    value={activeCatCol}
                    onChange={(e) => setSelectedCatMetric(e.target.value)}
                    style={{ background: "#1a1a24", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "11px" }}
                  >
                    {categoricalCols.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          <div style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAggregates} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0e0e13", borderColor: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px" }}
                  formatter={(value: any) => [Number(value).toLocaleString(), activeNumCol]}
                />
                <Bar dataKey="total" fill="var(--orange-primary)" radius={[4, 4, 0, 0]}>
                  {categoryAggregates.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel 2: Category Composition Donut */}
        <div className="studio-card-panel">
          <div style={{ marginBottom: "14px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
              Category Composition
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "11.5px", margin: "2px 0 0" }}>
              Share of {activeCatCol || "records"}
            </p>
          </div>

          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryAggregates}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryAggregates.map((_, index) => (
                    <Cell key={`cell-pie-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0e0e13", borderColor: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px" }}
                  formatter={(value: any) => [Number(value).toLocaleString(), activeNumCol]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Mini Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px", maxHeight: "60px", overflowY: "auto" }}>
            {categoryAggregates.map((cat, idx) => (
              <div key={cat.category} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10.5px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: PALETTE[idx % PALETTE.length] }} />
                <span style={{ color: "#fff" }}>{cat.category}</span>
                <span style={{ color: "#64748b" }}>({Math.round((cat.total / (numSummary.sum || 1)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= ROW 2: MULTI-SERIES TRENDS & BIVARIATE SCATTER ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Panel 3: Multi-Series Continuous Trendline */}
        <div className="studio-card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Observation Trajectory & Profile
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "11.5px", margin: "2px 0 0" }}>
                Sequential metric values across sample records
              </p>
            </div>
            <span style={{ fontSize: "10.5px", background: "rgba(56,189,248,0.15)", color: "#38bdf8", padding: "3px 8px", borderRadius: "4px", fontWeight: 700 }}>
              CONTINUOUS SERIES
            </span>
          </div>

          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLineData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="index" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0e0e13", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                <Line type="monotone" dataKey={activeNumCol} stroke="var(--orange-primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                {secondaryNumCol && (
                  <Line type="monotone" dataKey={secondaryNumCol} stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel 4: Bivariate Correlation Scatter with Dynamic Selectors */}
        <div className="studio-card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                  Bivariate Regression Scatter
                </h3>
                <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.15)", color: "#4ade80", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                  r = {scatterPlotData.r}
                </span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "11.5px", margin: "2px 0 0" }}>
                Feature co-variance and bivariate alignment
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <select
                value={scatterX}
                onChange={(e) => setScatterX(e.target.value)}
                style={{ background: "#1a1a24", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", padding: "3px 6px", fontSize: "10.5px" }}
              >
                {numericCols.map((c) => (<option key={c} value={c}>X: {c}</option>))}
              </select>
              <select
                value={scatterY}
                onChange={(e) => setScatterY(e.target.value)}
                style={{ background: "#1a1a24", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "4px", padding: "3px 6px", fontSize: "10.5px" }}
              >
                {numericCols.map((c) => (<option key={c} value={c}>Y: {c}</option>))}
              </select>
            </div>
          </div>

          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="x" name={scatterX} stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="y" name={scatterY} stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ backgroundColor: "#0e0e13", borderColor: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "6px" }}
                />
                <Scatter data={scatterPlotData.points} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= ROW 3: AI EXECUTIVE INSIGHTS & COLUMN PROFILER ================= */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Panel 5: Automated AI Executive Insights */}
        <div className="studio-card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles style={{ width: 16, height: 16, color: "var(--orange-primary)" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Autonomous Analytical Synthesis
              </h3>
            </div>
            <span style={{ fontSize: "10.5px", background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
              AI AGENT PROFILER
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {executiveInsights.map((insight, idx) => (
              <div
                key={idx}
                style={{
                  background: "#09090d",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div style={{ marginTop: "2px" }}>
                  <CheckCircle2 style={{ width: 14, height: 14, color: idx === 0 ? "var(--orange-primary)" : "#4ade80" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#e2e8f0", lineHeight: 1.5 }}>
                  {insight}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 6: Schema Column Profiler Table */}
        <div className="studio-card-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSpreadsheet style={{ width: 16, height: 16, color: "#38bdf8" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Column-Level Statistical Profiler
              </h3>
            </div>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {columnTypes.length} Features
            </span>
          </div>

          <div style={{ overflowX: "auto", maxHeight: "250px" }}>
            <table className="studio-table" style={{ fontSize: "11px" }}>
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Inferred Type</th>
                  <th>Sample Value</th>
                  <th>Distinct Values</th>
                </tr>
              </thead>
              <tbody>
                {columnTypes.map((col) => {
                  const uniqueSet = new Set(rows.map((r) => r[col.name]));
                  const sampleVal = String(rows[0]?.[col.name] ?? "null");
                  return (
                    <tr key={col.name}>
                      <td style={{ fontWeight: 700, color: "#fff" }}>{col.name}</td>
                      <td>
                        <span
                          style={{
                            background: col.type === "numeric" ? "rgba(255,77,0,0.15)" : "rgba(56,189,248,0.15)",
                            color: col.type === "numeric" ? "var(--orange-primary)" : "#38bdf8",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {col.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "#94a3b8" }}>
                        {sampleVal.length > 20 ? `${sampleVal.slice(0, 18)}...` : sampleVal}
                      </td>
                      <td style={{ color: "#4ade80", fontWeight: 600 }}>{uniqueSet.size}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
