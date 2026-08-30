export interface Artifact { id: string; kind: "report" | "chart" | "model" | "dataset-profile"; path: string; createdAt: string; runId: string; }
export function artifactManifest(runId: string, artifacts: Omit<Artifact, "runId">[]): Artifact[] { return artifacts.map((artifact) => ({ ...artifact, runId })); }
