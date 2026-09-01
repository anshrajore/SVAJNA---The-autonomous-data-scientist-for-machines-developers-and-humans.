import type { DataRow } from "./types.js";

export interface StandardizedDataset {
  columnNames: string[];
  types: Record<string, string>;
  rows: DataRow[];
}

/**
 * Standardizes schema types and normalizes field casing.
 */
export function standardizeDataset(rows: DataRow[]): StandardizedDataset {
  if (!rows.length) return { columnNames: [], types: {}, rows: [] };
  const rawKeys = [...new Set(rows.flatMap(Object.keys))];
  const columnNames = rawKeys.map((k) => k.trim().toLowerCase().replace(/\s+/g, "_"));

  const keyMap = new Map<string, string>();
  rawKeys.forEach((k, i) => keyMap.set(k, columnNames[i]!));

  const types: Record<string, string> = {};
  const standardizedRows = rows.map((row) => {
    const newRow: DataRow = {};
    for (const [key, val] of Object.entries(row)) {
      const normKey = keyMap.get(key)!;
      newRow[normKey] = val;
      if (!types[normKey] && val !== null && val !== undefined) {
        types[normKey] = typeof val;
      }
    }
    return newRow;
  });

  return { columnNames, types, rows: standardizedRows };
}
