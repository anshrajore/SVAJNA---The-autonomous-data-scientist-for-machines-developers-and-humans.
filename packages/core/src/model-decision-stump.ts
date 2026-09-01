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
  if (!nums.length) return { label: rows[0]?.[labelCol] ?? "unknown" };

  const threshold = nums.reduce((a, b) => a + b, 0) / nums.length;
  const leftRows = rows.filter((r) => parseFloat(String(r[featureCol])) <= threshold);
  const rightRows = rows.filter((r) => parseFloat(String(r[featureCol])) > threshold);

  const getMajority = (arr: DataRow[]) => {
    const counts = new Map<string | number, number>();
    arr.forEach((r) => counts.set(r[labelCol]!, (counts.get(r[labelCol]!) ?? 0) + 1));
    let best = arr[0]?.[labelCol] ?? "unknown";
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
