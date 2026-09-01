import type { DataRow } from "./types.js";

export interface DataTransformation {
  name: string;
  type: "fill_missing" | "normalize" | "filter_rows" | "drop_column";
  params: Record<string, unknown>;
}

/**
 * Deterministic data transformation engine for cleaning and preparing datasets.
 */
export class TransformationEngine {
  transform(rows: DataRow[], transform: DataTransformation): DataRow[] {
    if (transform.type === "fill_missing") {
      const col = String(transform.params.column ?? "");
      const val = transform.params.value ?? "";
      return rows.map((r) => ({
        ...r,
        [col]: r[col] === null || r[col] === undefined ? (val as any) : r[col],
      }));
    }
    if (transform.type === "filter_rows") {
      const col = String(transform.params.column ?? "");
      const targetVal = transform.params.value;
      return rows.filter((r) => r[col] === targetVal);
    }
    if (transform.type === "drop_column") {
      const col = String(transform.params.column ?? "");
      return rows.map((r) => {
        const copy = { ...r };
        delete copy[col];
        return copy;
      });
    }
    return rows;
  }
}
