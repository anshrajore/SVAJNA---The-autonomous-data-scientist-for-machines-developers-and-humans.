import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { DocsPage } from "./pages/DocsPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { McpPage } from "./pages/McpPage";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("home");

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ marginTop: "20px" }}>
        {activeTab === "home" && <HomePage onNavigate={setActiveTab} />}
        {activeTab === "docs" && <DocsPage />}
        {activeTab === "playground" && <PlaygroundPage />}
        {activeTab === "mcp" && <McpPage />}
      </main>

      <footer style={{
        marginTop: "80px",
        textAlign: "center",
        color: "#64748b",
        fontSize: "13px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        paddingTop: "30px"
      }}>
        SVAJNA — Autonomous Data Science with Verifiable Execution. Built by Ansh Rajore.
      </footer>
    </div>
  );
};

export default App;
