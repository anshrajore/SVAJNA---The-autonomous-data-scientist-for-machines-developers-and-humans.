import React from "react";

export const McpPage: React.FC = () => {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "48px", marginBottom: "16px" }}>
        Model Context Protocol (MCP) Server
      </h1>
      <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "36px", lineHeight: 1.6 }}>
        SVAJNA exposes a local stdio MCP server for seamless integration with AI agents, Claude Desktop, and Antigravity.
      </p>

      {/* Tools Specification */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>Exposed MCP Tools</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[
            {
              name: "data_profile",
              hint: "Read-Only",
              desc: "Read and deterministically profile a CSV or JSON dataset inside the current project directory.",
              schema: `{ "source": "project/relative/path.csv" }`
            },
            {
              name: "data_compare",
              hint: "Read-Only",
              desc: "Compare two local dataset schemas and report added, removed, or type-changed fields.",
              schema: `{ "before": "v1.csv", "after": "v2.csv" }`
            },
            {
              name: "analysis_execute",
              hint: "Write (.svajna/ state only)",
              desc: "Execute deterministic profiling, record an append-only event log, and render Markdown reports.",
              schema: `{ "source": "sales.csv" }`
            },
            {
              name: "pipeline_execute",
              hint: "Write (.svajna/ state only)",
              desc: "Run chained analysis pipeline steps (profile → validate → report) on target dataset.",
              schema: `{ "source": "sales.csv" }`
            },
            {
              name: "memory_read",
              hint: "Read-Only",
              desc: "Read persistent analytical memory graph, latest run metadata, and dataset quality scores.",
              schema: `{}`
            }
          ].map((tool) => (
            <div key={tool.name} style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "16px", color: "#2563eb" }}>{tool.name}</span>
                <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 600 }}>{tool.hint}</span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px" }}>{tool.desc}</p>
              <pre style={{ background: "#09090b", color: "#38bdf8", padding: "10px 14px", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{tool.schema}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Claude & Antigravity Setup Guide */}
      <section style={{ background: "#0f172a", color: "#fff", padding: "32px", borderRadius: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>Claude Desktop Config (`claude_desktop_config.json`)</h2>
        <pre style={{ background: "#1e293b", padding: "16px", borderRadius: "12px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#38bdf8", lineHeight: 1.5 }}>
{`{
  "mcpServers": {
    "svajna": {
      "command": "node",
      "args": ["/absolute/path/to/SVAJNA/packages/mcp/dist/index.js"]
    }
  }
}`}
        </pre>
      </section>
    </div>
  );
};
