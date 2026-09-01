import type { DataRow } from "./types.js";

export interface DecisionNode {
  feature?: string;
  threshold?: number;
  label?: string | number;
  left?: DecisionNode;
  right?: DecisionNode;
}

/**
 * Trains a simple Decision Stump / Single-split Decision Tree.
 */
export function trainDecisionStump(rows: DataRow[], featureCol: string, labelCol: string): DecisionNode {
  const nums = rows.map((r) => parseFloat(String(r[featureCol]))).filter((v) => !isNaN(v));
  if (!nums.length) {
    const raw = rows[0]?.[labelCol];
    const lbl = typeof raw === "string" || typeof raw === "number" ? raw : "unknown";
    return { label: lbl };
  }

  const threshold = nums.reduce((a, b) => a + b, 0) / nums.length;
  const leftRows = rows.filter((r) => parseFloat(String(r[featureCol])) <= threshold);
  const rightRows = rows.filter((r) => parseFloat(String(r[featureCol])) > threshold);

  const getMajority = (arr: DataRow[]): string | number => {
    const counts = new Map<string | number, number>();
    arr.forEach((r) => {
      const val = r[labelCol];
      if (typeof val === "string" || typeof val === "number") {
        counts.set(val, (counts.get(val) ?? 0) + 1);
      }
    });

    const firstRaw = arr[0]?.[labelCol];
    let best: string | number = typeof firstRaw === "string" || typeof firstRaw === "number" ? firstRaw : "unknown";
    let max = 0;
    for (const [k, c] of counts) {
      if (c > max) {
        max = c;
        best = k;
      }
    }
    return best;
  };

  return {
    feature: featureCol,
    threshold,
    left: { label: getMajority(leftRows) },
    right: { label: getMajority(rightRows) },
  };
}
