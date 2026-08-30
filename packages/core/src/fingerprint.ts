import { createHash } from "node:crypto";
import type { DataRow } from "./types.js";

export interface DatasetFingerprint { algorithm: "sha256"; value: string; rowCount: number; columns: string[]; }

/** Stable identity for a dataset's logical contents, independent of object-key order. */
export function fingerprintDataset(rows: DataRow[]): DatasetFingerprint {
  const columns = [...new Set(rows.flatMap(Object.keys))].sort();
  const canonical = rows.map((row) => columns.map((column) => [column, row[column] ?? null]));
  return { algorithm: "sha256", value: createHash("sha256").update(JSON.stringify(canonical)).digest("hex"), rowCount: rows.length, columns };
}
