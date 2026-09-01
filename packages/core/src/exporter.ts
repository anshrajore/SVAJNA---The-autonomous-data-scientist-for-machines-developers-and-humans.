import type { DataRow } from "./types.js";

export interface DataExportOptions {
  format: "csv" | "json";
}

/**
 * Serializes row arrays back into CSV string format.
 */
export function exportDataset(rows: DataRow[], options: DataExportOptions): string {
  if (options.format === "json") {
    return JSON.stringify(rows, null, 2);
  }

  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap(Object.keys))];
  const csvLines = [headers.join(",")];

  for (const row of rows) {
    const line = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") ? `"${str}"` : str;
    });
    csvLines.push(line.join(","));
  }

  return csvLines.join("\n");
}
