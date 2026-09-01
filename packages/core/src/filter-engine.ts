import type { DataRow } from "./types.js";

export interface DataFilterCondition {
  field: string;
  operator: "eq" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: unknown;
}

/**
 * Filter Engine for querying row collections with complex conditions.
 */
export function filterDataset(rows: DataRow[], conditions: DataFilterCondition[]): DataRow[] {
  return rows.filter((row) => {
    return conditions.every((cond) => {
      const val = row[cond.field];
      if (cond.operator === "eq") return val === cond.value;
      if (cond.operator === "gt") return (val as number) > (cond.value as number);
      if (cond.operator === "gte") return (val as number) >= (cond.value as number);
      if (cond.operator === "lt") return (val as number) < (cond.value as number);
      if (cond.operator === "lte") return (val as number) <= (cond.value as number);
      if (cond.operator === "contains") return String(val ?? "").includes(String(cond.value ?? ""));
      return true;
    });
  });
}
