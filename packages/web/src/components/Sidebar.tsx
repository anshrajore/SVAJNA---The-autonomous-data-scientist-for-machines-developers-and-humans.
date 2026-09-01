import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "📊 Dashboard Console", icon: "📊" },
    { id: "profiler", label: "🔬 Dataset Profiler", icon: "🔬" },
    { id: "ml_models", label: "🤖 ML Model Studio", icon: "🤖" },
    { id: "diff_tool", label: "⚡ Row Diff Engine", icon: "⚡" },
    { id: "export_import", label: "📥 Import / Export", icon: "📥" },
    { id: "cli_terminal", label: "💻 Terminal Console", icon: "💻" },
    { id: "mcp_docs", label: "🔌 MCP Server Tools", icon: "🔌" },
  ];

  return (
    <aside className="sidebar">
      {/* SVAJNA Header */}
      <div style={{ marginBottom: "36px", paddingLeft: "8px" }}>
        <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>
          SVAJNA <span style={{ fontSize: "10px", background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: "10px", verticalAlign: "middle" }}>PRO</span>
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Autonomous Data Operating System</div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer System Status */}
      <div style={{ marginTop: "auto", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: "11px", color: "#4ade80", fontWeight: 600 }}>● SYSTEM ACTIVE</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Verifiable Autonomy: Level 1</div>
      </div>
    </aside>
  );
};
