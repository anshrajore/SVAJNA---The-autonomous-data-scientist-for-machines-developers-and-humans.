import type { DataRow } from "./types.js";
export interface DataRule { id: string; description: string; evaluate(rows: DataRow[]): boolean; }
export function runRules(rows: DataRow[], rules: DataRule[]) { return rules.map((rule) => ({ id: rule.id, description: rule.description, passed: rule.evaluate(rows) })); }
export const nonEmptyRule = (column: string): DataRule => ({ id: `non_empty:${column}`, description: `${column} must be present`, evaluate: (rows) => rows.every((row) => row[column] !== null && row[column] !== undefined && row[column] !== "") });
