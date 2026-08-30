import type { DatasetProfile } from "./types.js";
export interface SchemaDiff { added: string[]; removed: string[]; typeChanged: Array<{ column: string; before: string; after: string }>; }
export function compareSchemas(before: DatasetProfile, after: DatasetProfile): SchemaDiff {
  const left = new Map(before.columns.map((column) => [column.name, column.kind])); const right = new Map(after.columns.map((column) => [column.name, column.kind]));
  return { added: [...right.keys()].filter((name) => !left.has(name)), removed: [...left.keys()].filter((name) => !right.has(name)), typeChanged: [...left.entries()].flatMap(([column, kind]) => right.has(column) && right.get(column) !== kind ? [{ column, before: kind, after: right.get(column)! }] : []) };
}
