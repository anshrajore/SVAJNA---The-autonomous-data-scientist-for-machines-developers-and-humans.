export interface CandidateCause { name: string; evidenceScore: number; temporalScore: number; }
export function rankCauses(causes: CandidateCause[]): Array<CandidateCause & { confidence: number }> { return causes.map((cause) => ({ ...cause, confidence: Math.round(((cause.evidenceScore * .7) + (cause.temporalScore * .3)) * 100) / 100 })).sort((a, b) => b.confidence - a.confidence); }
