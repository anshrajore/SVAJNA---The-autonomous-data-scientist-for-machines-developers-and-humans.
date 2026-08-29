export type Primitive = string | number | boolean | null;
export type DataRow = Record<string, Primitive>;

export type ColumnKind = "number" | "boolean" | "date" | "string" | "unknown";

export interface ColumnProfile {
  name: string;
  kind: ColumnKind;
  present: number;
  missing: number;
  distinct: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  sample: Primitive[];
}

export interface DatasetProfile {
  source: string;
  format: "csv" | "json";
  rowCount: number;
  columns: ColumnProfile[];
  quality: { score: number; findings: QualityFinding[] };
}

export interface QualityFinding {
  severity: "info" | "warning";
  code: "EMPTY_DATASET" | "MISSING_VALUES" | "DUPLICATE_ROWS" | "HIGH_CARDINALITY";
  message: string;
  column?: string;
}

export interface AnalysisEvent {
  event: "analysis.started" | "analysis.step.completed" | "analysis.completed" | "analysis.failed";
  taskId: string;
  phase: "discovery" | "profiling" | "reporting";
  operation: string;
  status: "success" | "failure";
  timestamp: string;
  durationMs?: number;
  artifacts?: string[];
}

export interface AnalysisRun {
  id: string;
  createdAt: string;
  profile: DatasetProfile;
  events: AnalysisEvent[];
  reportPath: string;
}
