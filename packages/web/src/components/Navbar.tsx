import React from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px" }}>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "26px",
          fontWeight: 700,
          fontStyle: "italic",
          letterSpacing: "-0.5px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
        onClick={() => setActiveTab("home")}
      >
        SVAJNA{" "}
        <span
          style={{
            background: "#000",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontStyle: "normal",
            fontSize: "10px",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "20px",
            textTransform: "uppercase",
          }}
        >
          V1.0
        </span>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {[
          { id: "home", label: "Overview" },
          { id: "docs", label: "CLI & Docs" },
          { id: "playground", label: "Data Workbench" },
          { id: "mcp", label: "MCP Protocol" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? "#ffffff" : "transparent",
              color: activeTab === tab.id ? "#09090b" : "#64748b",
              padding: "8px 16px",
              borderRadius: "20px",
              fontWeight: 600,
              fontSize: "14px",
              transition: "all 0.2s ease",
              boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}

        <a
          href="https://github.com/anshrajore/SVAJNA---The-autonomous-data-scientist-for-machines-developers-and-humans..git"
          target="_blank"
          rel="noreferrer"
          style={{
            background: "#09090b",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          }}
        >
          GitHub ↗
        </a>
      </nav>
    </header>
  );
};
