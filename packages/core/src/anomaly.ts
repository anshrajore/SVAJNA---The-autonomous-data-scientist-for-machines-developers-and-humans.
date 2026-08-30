import { describe, zScores } from "./statistics.js";
export interface Anomaly { index: number; value: number; zScore: number; severity: "warning" | "critical"; }
export function detectAnomalies(values: number[], threshold = 3): Anomaly[] { if (values.length < 3) return []; describe(values); return zScores(values).flatMap((zScore, index) => Math.abs(zScore) >= threshold ? [{ index, value: values[index], zScore, severity: Math.abs(zScore) >= threshold * 1.5 ? "critical" as const : "warning" as const }] : []); }
