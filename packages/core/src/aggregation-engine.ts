import type { DataRow } from "./types.js";

export interface DataAggregation {
  groupByColumn: string;
  targetColumn: string;
  operation: "sum" | "mean" | "count" | "min" | "max";
}

/**
 * Aggregates dataset rows by group column.
 */
export function aggregateDataset(rows: DataRow[], aggregation: DataAggregation): Record<string, number> {
  const groups = new Map<string, number[]>();

  for (const row of rows) {
    const key = String(row[aggregation.groupByColumn] ?? "null");
    const rawVal = row[aggregation.targetColumn];
    const val = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal ?? 0)) || 0;

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(val);
  }

  const result: Record<string, number> = {};
  for (const [key, values] of groups) {
    if (aggregation.operation === "count") {
      result[key] = values.length;
    } else if (aggregation.operation === "sum") {
      result[key] = values.reduce((a, b) => a + b, 0);
    } else if (aggregation.operation === "mean") {
      result[key] = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    } else if (aggregation.operation === "min") {
      result[key] = Math.min(...values);
    } else if (aggregation.operation === "max") {
      result[key] = Math.max(...values);
    }
  }

  return result;
}
