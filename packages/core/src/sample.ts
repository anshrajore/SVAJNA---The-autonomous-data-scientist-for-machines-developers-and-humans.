import type { DataRow } from "./types.js";
/** Deterministic reservoir-like sample chosen by stable row position. */
export function sampleRows(rows: DataRow[], limit: number): DataRow[] { if (limit <= 0) return []; if (rows.length <= limit) return [...rows]; const stride = rows.length / limit; return Array.from({ length: limit }, (_, index) => rows[Math.floor(index * stride)]); }
