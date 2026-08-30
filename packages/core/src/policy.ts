import type { AutonomyLevel } from "./config.js";
export type Capability = "data.read" | "artifact.write" | "sql.write" | "model.deploy";
export interface PolicyDecision { allowed: boolean; approvalRequired: boolean; reason: string; }
export function evaluatePolicy(capability: Capability, autonomy: AutonomyLevel): PolicyDecision { if (capability === "data.read") return { allowed: true, approvalRequired: false, reason: "Read-only data access is permitted." }; if (capability === "artifact.write") return { allowed: autonomy >= 1, approvalRequired: false, reason: "Analysis artifacts are project-local." }; return { allowed: autonomy >= 5, approvalRequired: true, reason: "High-impact action requires explicit approval." }; }
