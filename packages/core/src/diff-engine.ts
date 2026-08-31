import type { DataRow } from "./types.js";

export interface RowDiffResult {
  added: DataRow[];
  removed: DataRow[];
  modified: Array<{ before: DataRow; after: DataRow }>;
  unchangedCount: number;
}

/**
 * Deterministic row-level data diff engine.
 */
export function diffRows(beforeRows: DataRow[], afterRows: DataRow[], keyColumn: string): RowDiffResult {
  const beforeMap = new Map<string, DataRow>();
  const afterMap = new Map<string, DataRow>();

  for (const row of beforeRows) {
    const key = String(row[keyColumn] ?? "");
    if (key) beforeMap.set(key, row);
  }

  for (const row of afterRows) {
    const key = String(row[keyColumn] ?? "");
    if (key) afterMap.set(key, row);
  }

  const added: DataRow[] = [];
  const removed: DataRow[] = [];
  const modified: Array<{ before: DataRow; after: DataRow }> = [];
  let unchangedCount = 0;

  for (const [key, afterRow] of afterMap) {
    const beforeRow = beforeMap.get(key);
    if (!beforeRow) {
      added.push(afterRow);
    } else {
      if (JSON.stringify(beforeRow) !== JSON.stringify(afterRow)) {
        modified.push({ before: beforeRow, after: afterRow });
      } else {
        unchangedCount++;
      }
    }
  }

  for (const [key, beforeRow] of beforeMap) {
    if (!afterMap.has(key)) {
      removed.push(beforeRow);
    }
  }

  return { added, removed, modified, unchangedCount };
}
