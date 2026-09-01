import type { DataRow } from "./types.js";

export interface DataJoinConfig {
  leftKey: string;
  rightKey: string;
  type: "inner" | "left";
}

/**
 * Deterministic relational join engine for datasets.
 */
export function joinDatasets(leftRows: DataRow[], rightRows: DataRow[], config: DataJoinConfig): DataRow[] {
  const rightMap = new Map<string, DataRow>();
  for (const r of rightRows) {
    const key = String(r[config.rightKey] ?? "");
    if (key) rightMap.set(key, r);
  }

  const result: DataRow[] = [];
  for (const left of leftRows) {
    const key = String(left[config.leftKey] ?? "");
    const right = rightMap.get(key);

    if (right) {
      result.push({ ...left, ...right });
    } else if (config.type === "left") {
      result.push({ ...left });
    }
  }

  return result;
}
