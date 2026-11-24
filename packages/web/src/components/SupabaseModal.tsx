import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  RotateCcw,
  Cloud,
  Lock,
  ArrowRight,
  Server,
  Activity,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getSupabaseConfig,
  setSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from "../services/supabase-client";

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionStatusChange?: (connected: boolean) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConnectionStatusChange,
}) => {
  const [url, setUrl] = useState<string>("");
  const [anonKey, setAnonKey] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        latencyMs: 0,
        error: "Please enter both Project URL and Anon API Key.",
      });
      return;
    }

    // Temporarily save to test
    setSupabaseConfig(url.trim(), anonKey.trim());
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection();
    setIsTesting(false);
    setTestResult(result);

    if (onConnectionStatusChange) {
      onConnectionStatusChange(result.success);
    }
  };

  const handleSave = async () => {
    setSupabaseConfig(url.trim(), anonKey.trim());
    const res = await testSupabaseConnection();
    setTestResult(res);
    if (onConnectionStatusChange) {
      onConnectionStatusChange(res.success);
    }
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl("");
    setAnonKey("");
    setTestResult(null);
    if (onConnectionStatusChange) {
      onConnectionStatusChange(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#0d0d12",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.8), 0 0 2px rgba(255,77,0,0.4)",
          padding: "26px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(62,207,142,0.2), rgba(255,77,0,0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(62,207,142,0.3)",
              }}
            >
              <Database style={{ width: 22, height: 22, color: "#3ecf8e" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#fff", margin: 0 }}>
                Connect Real Supabase Backend
              </h3>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0" }}>
                Cloud persistence, automated schema syncing & audit trail replication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                width: "100%",
                background: "#121218",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "12.5px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              style={{
                width: "100%",
                background: "#121218",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#fff",
                fontSize: "12.5px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          {/* Test Status Feedback Banner */}
          {testResult && (
            <div
              style={{
                background: testResult.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${testResult.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                borderRadius: "8px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {testResult.success ? (
                  <CheckCircle2 style={{ width: 16, height: 16, color: "#4ade80" }} />
                ) : (
                  <AlertCircle style={{ width: 16, height: 16, color: "#f87171" }} />
                )}
                <div style={{ fontSize: "12px", color: testResult.success ? "#4ade80" : "#fca5a5" }}>
                  {testResult.success
                    ? `Connected successfully! Latency: ${testResult.latencyMs}ms`
                    : testResult.error}
                </div>
              </div>
              {testResult.success && (
                <span
                  style={{
                    background: "#3ecf8e",
                    color: "#000",
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  LIVE
                </span>
              )}
            </div>
          )}

          {/* Collapsible SQL Schema Info */}
          <div>
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--orange-primary)",
                fontSize: "11.5px",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Server style={{ width: 12, height: 12 }} />
              {showSqlGuide ? "Hide Schema Instructions" : "Need to initialize database tables? Click here"}
            </button>

            {showSqlGuide && (
              <div
                style={{
                  background: "#08080c",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginTop: "8px",
                  fontSize: "11.5px",
                  color: "#94a3b8",
                  lineHeight: 1.5,
                }}
              >
                Execute the migrations in <code>docs/SUPABASE_SCHEMA.sql</code> inside your Supabase project&apos;s SQL Editor. This sets up 5 core tables (<code>svajna_datasets</code>, <code>svajna_pipeline_runs</code>, <code>svajna_model_registry</code>, <code>svajna_audit_logs</code>, <code>svajna_quality_issues</code>) with indexes and Row Level Security.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "16px",
          }}
        >
          <button
            onClick={handleClear}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleTest}
              disabled={isTesting}
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Activity style={{ width: 14, height: 14, color: "var(--orange-primary)" }} />
              {isTesting ? "Testing..." : "Test Ping"}
            </button>

            <button
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, #ff4d00, #ff6b26)",
                border: "none",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255,77,0,0.3)",
              }}
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseModal;
