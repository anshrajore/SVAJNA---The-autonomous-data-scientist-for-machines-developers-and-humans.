export interface Evidence { id: string; statement: string; source: string; confidence: number; }
export interface Claim { statement: string; evidenceIds: string[]; status: "supported" | "insufficient"; }
export function validateClaim(statement: string, evidence: Evidence[], minimumConfidence = 0.8): Claim { const evidenceIds = evidence.filter((item) => item.confidence >= minimumConfidence).map((item) => item.id); return { statement, evidenceIds, status: evidenceIds.length ? "supported" : "insufficient" }; }
