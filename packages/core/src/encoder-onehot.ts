import type { DataRow } from "./types.js";

export interface OneHotResult {
  encodedRows: DataRow[];
  newColumns: string[];
}

/**
 * Encodes categorical string columns into binary One-Hot columns.
 */
export function oneHotEncode(rows: DataRow[], column: string): OneHotResult {
  const categories = [...new Set(rows.map((r) => String(r[column] ?? "unknown")))];
  const newColumns = categories.map((cat) => `${column}_${cat.toLowerCase().replace(/\s+/g, "_")}`);

  const encodedRows = rows.map((r) => {
    const copy = { ...r };
    const val = String(r[column] ?? "unknown");
    categories.forEach((cat, idx) => {
      copy[newColumns[idx]!] = val === cat ? 1 : 0;
    });
    return copy;
  });

  return { encodedRows, newColumns };
}
