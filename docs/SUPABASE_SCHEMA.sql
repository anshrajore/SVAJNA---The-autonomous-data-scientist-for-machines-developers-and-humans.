-- ============================================================================
-- SVAJNA Autonomous Data Science Operating System — Supabase Backend Schema
-- Architected & Engineered by ANSH RAJORE
-- ============================================================================
-- Run this migration in the Supabase SQL Editor to enable real cloud sync.
-- Compatible with PostgreSQL 15+ / Supabase Database.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Datasets Table (Stores imported tabular datasets and inferred schemas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.svajna_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    column_count INTEGER NOT NULL DEFAULT 0,
    columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    numeric_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    categorical_columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    inferred_target TEXT,
    sample_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    sha256_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_svajna_datasets_name ON public.svajna_datasets (name);
CREATE INDEX IF NOT EXISTS idx_svajna_datasets_created_at ON public.svajna_datasets (created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. Pipeline Runs Table (Records 12-stage execution snapshots & results)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.svajna_pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
    current_stage TEXT NOT NULL DEFAULT 'ingest',
    completed_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    problem_type TEXT NOT NULL DEFAULT 'regression',
    target_column TEXT,
    split_summary JSONB DEFAULT '{}'::jsonb,
    metrics JSONB DEFAULT '{}'::jsonb,
    transformation_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    sha256_audit_proof TEXT,
    execution_duration_ms INTEGER DEFAULT 0,
    report_markdown TEXT,
    report_html TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_svajna_pipeline_runs_dataset ON public.svajna_pipeline_runs (dataset_name);
CREATE INDEX IF NOT EXISTS idx_svajna_pipeline_runs_status ON public.svajna_pipeline_runs (status);
CREATE INDEX IF NOT EXISTS idx_svajna_pipeline_runs_created_at ON public.svajna_pipeline_runs (created_at DESC);

-- ----------------------------------------------------------------------------
-- 3. Model Registry Table (Stores Champion models, parameters & leaderboards)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.svajna_model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    problem_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'deployed', -- 'deployed', 'candidate', 'archived'
    val_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    test_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_importance JSONB NOT NULL DEFAULT '[]'::jsonb,
    leaderboard JSONB NOT NULL DEFAULT '[]'::jsonb,
    sha256_checkpoint_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_svajna_model_registry_dataset ON public.svajna_model_registry (dataset_name);
CREATE INDEX IF NOT EXISTS idx_svajna_model_registry_model_name ON public.svajna_model_registry (model_name);

-- ----------------------------------------------------------------------------
-- 4. Audit Logs Table (Append-only tamper-evident compliance audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.svajna_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'ANSH_RAJORE_STUDIO_AGENT',
    payload_hash TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_svajna_audit_logs_event_type ON public.svajna_audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_svajna_audit_logs_timestamp ON public.svajna_audit_logs (timestamp DESC);

-- ----------------------------------------------------------------------------
-- 5. Data Quality Anomalies Table (Stores detected issues & remediations)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.svajna_quality_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_name TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    column_name TEXT,
    severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'critical'
    description TEXT NOT NULL,
    confidence NUMERIC(4, 3) DEFAULT 0.900,
    remediation JSONB NOT NULL DEFAULT '{}'::jsonb,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_svajna_quality_issues_dataset ON public.svajna_quality_issues (dataset_name);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS) Setup
-- ----------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.svajna_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svajna_pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svajna_model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svajna_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.svajna_quality_issues ENABLE ROW LEVEL SECURITY;

-- Anonymous public read & write policies (for direct Studio Web Client integration via anon key)
CREATE POLICY "Allow anon read datasets" ON public.svajna_datasets FOR SELECT USING (true);
CREATE POLICY "Allow anon insert datasets" ON public.svajna_datasets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update datasets" ON public.svajna_datasets FOR UPDATE USING (true);

CREATE POLICY "Allow anon read pipeline runs" ON public.svajna_pipeline_runs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert pipeline runs" ON public.svajna_pipeline_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update pipeline runs" ON public.svajna_pipeline_runs FOR UPDATE USING (true);

CREATE POLICY "Allow anon read model registry" ON public.svajna_model_registry FOR SELECT USING (true);
CREATE POLICY "Allow anon insert model registry" ON public.svajna_model_registry FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon read audit logs" ON public.svajna_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert audit logs" ON public.svajna_audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon read quality issues" ON public.svajna_quality_issues FOR SELECT USING (true);
CREATE POLICY "Allow anon insert quality issues" ON public.svajna_quality_issues FOR INSERT WITH CHECK (true);
