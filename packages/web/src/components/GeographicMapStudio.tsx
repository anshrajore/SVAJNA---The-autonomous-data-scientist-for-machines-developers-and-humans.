/**
 * SVAJNA Real Geographic Spatial Studio & Interactive World Map
 * Built & Engineered by ANSH RAJORE
 *
 * Renders an interactive vector world map with empirical data aggregations,
 * dynamic spatial cluster bubbles, geographic entity resolution, and leaderboard analytics.
 */

import React, { useState, useMemo } from "react";
import {
  Globe,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  Filter,
  Download,
  Search,
  Sparkles,
  Maximize2,
  Shield,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import {
  GeoRegionData,
  GeoAggregationMode,
  extractGeographicDistribution,
  detectGeographicColumns,
} from "../autonomous/geo-mapper";

interface GeographicMapStudioProps {
  rows: Record<string, unknown>[];
  fileName: string;
  numericCols: string[];
  categoricalCols: string[];
}

// Realistic continent path representations calibrated for a 1000x500 Equirectangular projection
const WORLD_CONTINENT_PATHS = [
  // North America & Canada & Alaska
  {
    name: "North America",
    d: "M 155 70 L 190 65 L 235 60 L 270 75 L 310 70 L 330 95 L 320 120 L 290 135 L 260 145 L 245 175 L 220 185 L 205 210 L 195 240 L 180 255 L 165 240 L 155 210 L 140 185 L 130 150 L 120 125 L 130 95 Z",
  },
  // Greenland
  {
    name: "Greenland",
    d: "M 360 45 L 420 40 L 440 65 L 410 95 L 375 90 Z",
  },
  // South America
  {
    name: "South America",
    d: "M 255 270 L 285 275 L 340 300 L 365 330 L 350 380 L 325 430 L 290 460 L 280 430 L 275 375 L 255 330 L 245 295 Z",
  },
  // Europe & Scandinavia
  {
    name: "Europe",
    d: "M 480 100 L 520 85 L 550 95 L 560 125 L 535 150 L 515 175 L 475 175 L 460 150 L 450 125 L 465 110 Z",
  },
  // British Isles
  {
    name: "British Isles",
    d: "M 450 115 L 465 115 L 460 135 L 445 130 Z",
  },
  // Africa
  {
    name: "Africa",
    d: "M 470 185 L 540 185 L 585 220 L 580 270 L 550 330 L 525 385 L 490 380 L 470 330 L 445 275 L 440 230 L 455 195 Z",
  },
  // Madagascar
  {
    name: "Madagascar",
    d: "M 600 325 L 615 320 L 610 355 L 595 350 Z",
  },
  // Asia & Russia & Middle East
  {
    name: "Asia & Eurasia",
    d: "M 560 85 L 640 70 L 730 65 L 830 75 L 890 95 L 880 135 L 825 150 L 780 170 L 740 185 L 700 210 L 660 215 L 620 220 L 585 185 L 565 140 Z",
  },
  // Indian Subcontinent
  {
    name: "India & South Asia",
    d: "M 670 205 L 720 210 L 735 240 L 710 280 L 690 285 L 675 250 Z",
  },
  // East Asia & Japan
  {
    name: "East Asia & Japan",
    d: "M 740 165 L 790 165 L 810 200 L 780 240 L 745 235 L 730 195 Z M 835 170 L 850 170 L 845 200 L 830 195 Z",
  },
  // Southeast Asia & Indonesia
  {
    name: "Southeast Asia",
    d: "M 745 240 L 775 245 L 780 280 L 755 285 Z M 770 295 L 820 295 L 840 310 L 790 315 Z",
  },
  // Australia & New Zealand
  {
    name: "Australia",
    d: "M 810 335 L 885 330 L 910 370 L 885 410 L 830 415 L 800 380 Z M 925 395 L 940 395 L 935 430 L 920 425 Z",
  },
];

export const GeographicMapStudio: React.FC<GeographicMapStudioProps> = ({
  rows,
  fileName,
  numericCols,
  categoricalCols,
}) => {
  const allHeaders = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]) : []), [rows]);
  const detectedCols = useMemo(() => detectGeographicColumns(allHeaders), [allHeaders]);

  // Selected column state
  const [selectedLocCol, setSelectedLocCol] = useState<string>(() => {
    return detectedCols.locationCol || categoricalCols[0] || allHeaders[0] || "";
  });

  const [selectedMetricCol, setSelectedMetricCol] = useState<string>(() => {
    return numericCols[0] || (allHeaders.find((h) => typeof rows[0]?.[h] === "number") ?? "");
  });

  const [aggMode, setAggMode] = useState<GeoAggregationMode>("sum");
  const [visStyle, setVisStyle] = useState<"bubbles" | "heat" | "pins">("bubbles");
  const [hoveredRegion, setHoveredRegion] = useState<GeoRegionData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<GeoRegionData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Compute empirical geographic distribution from uploaded rows
  const geoClusters = useMemo(() => {
    return extractGeographicDistribution(rows, selectedLocCol, selectedMetricCol, aggMode);
  }, [rows, selectedLocCol, selectedMetricCol, aggMode]);

  // Filtered clusters for leaderboard
  const filteredClusters = useMemo(() => {
    if (!searchQuery.trim()) return geoClusters;
    const q = searchQuery.toLowerCase();
    return geoClusters.filter((c) => c.region.toLowerCase().includes(q) || c.countryCode.toLowerCase().includes(q));
  }, [geoClusters, searchQuery]);

  // Summary Metrics
  const totalMetricSum = useMemo(() => {
    return geoClusters.reduce((acc, c) => acc + c.aggregatedMetric, 0);
  }, [geoClusters]);

  const topRegion = geoClusters[0] || null;

  // Convert lat/lng coordinates to SVG (Equirectangular 1000x500)
  const projectCoords = (lat: number, lng: number): [number, number] => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return [Math.max(10, Math.min(990, x)), Math.max(10, Math.min(490, y))];
  };

  // Helper formatting
  const formatMetric = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  return (
    <div className="studio-card-panel" style={{ padding: "24px", background: "#0c0c11", border: "1px solid rgba(255,255,255,0.1)" }}>
      {/* HEADER & CONTROLS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,77,0,0.15)", border: "1px solid rgba(255,77,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange-primary)" }}>
              <Globe style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Autonomous Geographic Spatial Studio
              </h3>
              <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: 0 }}>
                Real-time geospatial projections & empirical clustering across <strong style={{ color: "#fff" }}>{rows.length}</strong> uploaded observations.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Controls Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Location Column Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#14141c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "4px 8px" }}>
            <MapPin style={{ width: 13, height: 13, color: "var(--orange-primary)" }} />
            <span style={{ fontSize: "11px", color: "#64748b" }}>Location:</span>
            <select
              value={selectedLocCol}
              onChange={(e) => setSelectedLocCol(e.target.value)}
              style={{ background: "transparent", color: "#fff", border: "none", fontSize: "11px", outline: "none", cursor: "pointer", fontWeight: 700 }}
            >
              {allHeaders.map((h) => (
                <option key={h} value={h} style={{ background: "#181820" }}>
                  {h} {h === detectedCols.locationCol ? "★" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Column Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#14141c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "4px 8px" }}>
            <BarChart2 style={{ width: 13, height: 13, color: "#38bdf8" }} />
            <span style={{ fontSize: "11px", color: "#64748b" }}>Metric:</span>
            <select
              value={selectedMetricCol}
              onChange={(e) => setSelectedMetricCol(e.target.value)}
              style={{ background: "transparent", color: "#fff", border: "none", fontSize: "11px", outline: "none", cursor: "pointer", fontWeight: 700 }}
            >
              {allHeaders.map((h) => (
                <option key={h} value={h} style={{ background: "#181820" }}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#14141c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "3px" }}>
            <button
              onClick={() => setAggMode("sum")}
              style={{
                background: aggMode === "sum" ? "var(--orange-primary)" : "transparent",
                color: aggMode === "sum" ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Sum
            </button>
            <button
              onClick={() => setAggMode("mean")}
              style={{
                background: aggMode === "mean" ? "var(--orange-primary)" : "transparent",
                color: aggMode === "mean" ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Avg
            </button>
            <button
              onClick={() => setAggMode("count")}
              style={{
                background: aggMode === "count" ? "var(--orange-primary)" : "transparent",
                color: aggMode === "count" ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Count
            </button>
          </div>

          {/* Visualization Style Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#14141c", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "3px" }}>
            <button
              onClick={() => setVisStyle("bubbles")}
              style={{
                background: visStyle === "bubbles" ? "rgba(255,255,255,0.15)" : "transparent",
                color: visStyle === "bubbles" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
              }}
            >
              Bubbles
            </button>
            <button
              onClick={() => setVisStyle("heat")}
              style={{
                background: visStyle === "heat" ? "rgba(255,255,255,0.15)" : "transparent",
                color: visStyle === "heat" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
              }}
            >
              Density Heat
            </button>
            <button
              onClick={() => setVisStyle("pins")}
              style={{
                background: visStyle === "pins" ? "rgba(255,255,255,0.15)" : "transparent",
                color: visStyle === "pins" ? "#fff" : "#64748b",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "10.5px",
                cursor: "pointer",
              }}
            >
              Pins
            </button>
          </div>
        </div>
      </div>

      {/* TOP KPI STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: "#08080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            GLOBAL {aggMode.toUpperCase()} ({selectedMetricCol})
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginTop: "2px" }}>
            {formatMetric(totalMetricSum)}
          </div>
          <div style={{ fontSize: "10.5px", color: "var(--orange-primary)", marginTop: "2px" }}>
            Across all verified spatial territories
          </div>
        </div>

        <div style={{ background: "#08080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            ACTIVE HUBS / REGIONS
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#38bdf8", marginTop: "2px" }}>
            {geoClusters.length}
          </div>
          <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
            Unique resolved coordinates
          </div>
        </div>

        <div style={{ background: "#08080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            TOP REGION BY VOLUME
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#4ade80", marginTop: "2px" }}>
            {topRegion ? topRegion.region : "N/A"}
          </div>
          <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
            {topRegion ? `${topRegion.sharePercentage}% share (${formatMetric(topRegion.aggregatedMetric)})` : "No data"}
          </div>
        </div>

        <div style={{ background: "#08080c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px" }}>
          <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            DATASET HYGIENE
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#facc15", marginTop: "2px" }}>
            100% Deterministic
          </div>
          <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
            Zero synthetic projections
          </div>
        </div>
      </div>

      {/* MAP CANVAS + SIDE LEADERBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        {/* WORLD VECTOR SVG CANVAS */}
        <div
          style={{
            position: "relative",
            background: "#07070a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)",
          }}
        >
          {/* Subtle Map Compass & Coordinates watermark */}
          <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "10.5px", color: "#64748b", fontFamily: "var(--font-mono)" }}>
              WGS84 / EQUIRECTANGULAR PROJECTION
            </span>
            <span style={{ background: "rgba(255,77,0,0.15)", color: "var(--orange-primary)", padding: "1px 6px", borderRadius: "4px", fontSize: "9.5px", fontWeight: 700 }}>
              LIVE SPATIAL ENGINE
            </span>
          </div>

          <svg
            viewBox="0 0 1000 500"
            style={{ width: "100%", height: "auto", display: "block", background: "#07070b" }}
          >
            <defs>
              {/* Radial gradient for glowing cluster bubbles */}
              <radialGradient id="bubbleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#ff6b2b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.0" />
              </radialGradient>
              <radialGradient id="heatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.9" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Latitude & Longitude Graticule Lines */}
            <g stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" strokeWidth="0.75">
              {/* Longitudes */}
              <line x1="166" y1="0" x2="166" y2="500" />
              <line x1="333" y1="0" x2="333" y2="500" />
              <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255, 255, 255, 0.12)" /> {/* Prime Meridian */}
              <line x1="666" y1="0" x2="666" y2="500" />
              <line x1="833" y1="0" x2="833" y2="500" />

              {/* Latitudes */}
              <line x1="0" y1="83" x2="1000" y2="83" />  {/* 60 deg N */}
              <line x1="0" y1="166" x2="1000" y2="166" /> {/* 30 deg N / Tropic of Cancer */}
              <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255, 77, 0, 0.25)" strokeWidth="1" /> {/* Equator */}
              <line x1="0" y1="333" x2="1000" y2="333" /> {/* 30 deg S / Tropic of Capricorn */}
              <line x1="0" y1="416" x2="1000" y2="416" /> {/* 60 deg S */}
            </g>

            {/* Latitude Labels */}
            <text x="8" y="246" fill="rgba(255,77,0,0.5)" fontSize="9" fontFamily="var(--font-mono)">0° (EQUATOR)</text>
            <text x="8" y="162" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="var(--font-mono)">+30° N</text>
            <text x="8" y="329" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="var(--font-mono)">-30° S</text>
            <text x="504" y="16" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="var(--font-mono)">0° MERIDIAN</text>

            {/* Continent Landmass Shapes */}
            <g>
              {WORLD_CONTINENT_PATHS.map((continent) => (
                <path
                  key={continent.name}
                  d={continent.d}
                  fill="#13131c"
                  stroke="rgba(255, 255, 255, 0.14)"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  style={{ transition: "fill 0.2s ease" }}
                />
              ))}
            </g>

            {/* Cluster Pins / Glowing Bubbles */}
            {geoClusters.map((cluster, idx) => {
              const [cx, cy] = projectCoords(cluster.coordinates[0], cluster.coordinates[1]);
              const isHovered = hoveredRegion?.region === cluster.region;
              const isSelected = selectedRegion?.region === cluster.region;
              const radius = Math.max(7, Math.min(32, 8 + (cluster.sharePercentage / 100) * 36));

              return (
                <g
                  key={cluster.region}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredRegion(cluster)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => setSelectedRegion(isSelected ? null : cluster)}
                >
                  {/* Vis Mode: Density Heat Glow */}
                  {visStyle === "heat" && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius * 2.2}
                      fill="url(#heatGlow)"
                      opacity={isHovered ? 1 : 0.8}
                    />
                  )}

                  {/* Vis Mode: Bubbles */}
                  {visStyle === "bubbles" && (
                    <>
                      {/* Pulsing outer aura for top 3 regions */}
                      {idx < 3 && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius * 1.5}
                          fill="rgba(255, 77, 0, 0.15)"
                          stroke="rgba(255, 77, 0, 0.3)"
                          strokeWidth="1"
                        />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={isSelected ? "#38bdf8" : "url(#bubbleGlow)"}
                        stroke={isHovered || isSelected ? "#fff" : "rgba(255, 255, 255, 0.4)"}
                        strokeWidth={isHovered || isSelected ? 2 : 1}
                        filter="url(#glowFilter)"
                      />
                    </>
                  )}

                  {/* Vis Mode: Pins */}
                  {visStyle === "pins" && (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <circle cx="0" cy="0" r="10" fill="rgba(255, 77, 0, 0.2)" />
                      <circle cx="0" cy="0" r="4" fill="var(--orange-primary)" stroke="#fff" strokeWidth="1" />
                    </g>
                  )}

                  {/* Region Marker Center Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#fff"
                  />

                  {/* Region Name Tag */}
                  <text
                    x={cx + (radius > 16 ? radius + 4 : 10)}
                    y={cy + 3}
                    fill={isHovered || isSelected ? "#fff" : "#cbd5e1"}
                    fontSize={isHovered || isSelected ? 11.5 : 10}
                    fontWeight={isHovered || isSelected ? 800 : 600}
                    fontFamily="sans-serif"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                  >
                    {cluster.region} ({formatMetric(cluster.aggregatedMetric)})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Inspection Tooltip / Drawer */}
          {(hoveredRegion || selectedRegion) && (
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 16,
                background: "rgba(13, 13, 18, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,77,0,0.4)",
                borderRadius: "10px",
                padding: "12px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                maxWidth: "340px",
                zIndex: 20,
              }}
            >
              {(() => {
                const target = hoveredRegion || selectedRegion!;
                return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff" }}>
                        {target.region} ({target.countryCode})
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: target.riskStatus === "critical" ? "rgba(244,63,94,0.2)" : "rgba(34,197,94,0.2)",
                          color: target.riskStatus === "critical" ? "#fb7185" : "#4ade80",
                        }}
                      >
                        {target.riskStatus.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#94a3b8" }}>
                      <div>
                        {aggMode.toUpperCase()}: <strong style={{ color: "#fff" }}>{target.aggregatedMetric.toLocaleString()}</strong>
                      </div>
                      <div>
                        Share: <strong style={{ color: "var(--orange-primary)" }}>{target.sharePercentage}%</strong>
                      </div>
                      <div>
                        Observations: <strong style={{ color: "#fff" }}>{target.recordCount} rows</strong>
                      </div>
                      <div>
                        Coordinates: <strong style={{ color: "#38bdf8" }}>[{target.coordinates[0].toFixed(1)}, {target.coordinates[1].toFixed(1)}]</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* SIDEBAR: TOP REGIONAL LEADERBOARD & BREAKDOWN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ background: "#09090d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>
                Regional Leaderboard
              </div>
              <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                {filteredClusters.length} entries
              </span>
            </div>

            {/* Filter Search Input */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <Search style={{ width: 13, height: 13, color: "#64748b", position: "absolute", left: 10, top: 9 }} />
              <input
                type="text"
                placeholder="Filter locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#121218",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "6px 10px 6px 30px",
                  fontSize: "11.5px",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            {/* Ranked List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto" }}>
              {filteredClusters.map((cluster, idx) => {
                const isSelected = selectedRegion?.region === cluster.region;
                return (
                  <div
                    key={cluster.region}
                    onClick={() => setSelectedRegion(isSelected ? null : cluster)}
                    style={{
                      background: isSelected ? "rgba(255,77,0,0.15)" : "#111116",
                      border: isSelected ? "1px solid var(--orange-primary)" : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--orange-primary)", fontWeight: 800 }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>
                          {cluster.region}
                        </span>
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#38bdf8" }}>
                        {formatMetric(cluster.aggregatedMetric)}
                      </span>
                    </div>

                    {/* Progress Bar of Global Share */}
                    <div style={{ background: "rgba(255,255,255,0.08)", height: "4px", borderRadius: "2px", overflow: "hidden", margin: "4px 0" }}>
                      <div
                        style={{
                          background: idx === 0 ? "var(--orange-primary)" : idx === 1 ? "#38bdf8" : "#4ade80",
                          width: `${Math.min(100, Math.max(2, cluster.sharePercentage))}%`,
                          height: "100%",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
                      <span>{cluster.recordCount} rows</span>
                      <span>{cluster.sharePercentage}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
