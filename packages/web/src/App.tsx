import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardConsole } from "./pages/DashboardConsole";
import { PlaygroundPage as DatasetProfiler } from "./pages/PlaygroundPage";
import { MlModelStudio } from "./pages/MlModelStudio";
import { ImportExportStudio } from "./pages/ImportExportStudio";
import { DocsPage as TerminalConsole } from "./pages/DocsPage";
import { McpPage as McpDocs } from "./pages/McpPage";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="full-app-layout">
      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Full-Screen Console Content */}
      <main className="main-content">
        {activeTab === "dashboard" && <DashboardConsole />}
        {activeTab === "profiler" && <DatasetProfiler />}
        {activeTab === "ml_models" && <MlModelStudio />}
        {activeTab === "diff_tool" && <DatasetProfiler />}
        {activeTab === "export_import" && <ImportExportStudio />}
        {activeTab === "cli_terminal" && <TerminalConsole />}
        {activeTab === "mcp_docs" && <McpDocs />}
      </main>
    </div>
  );
};

export default App;
