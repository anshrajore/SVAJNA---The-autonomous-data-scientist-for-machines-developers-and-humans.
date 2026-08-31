import type { DatasetProfile, ColumnProfile } from "./types.js";

export interface SchemaMigration {
  addedColumns: ColumnProfile[];
  removedColumns: string[];
  typeChanges: Array<{ column: string; from: string; to: string }>;
  isCompatible: boolean;
}

/**
 * Detects schema migrations and compatibility breaking changes between dataset versions.
 */
export function detectSchemaMigration(before: DatasetProfile, after: DatasetProfile): SchemaMigration {
  const beforeCols = new Map(before.columns.map((c) => [c.name, c]));
  const afterCols = new Map(after.columns.map((c) => [c.name, c]));

  const addedColumns: ColumnProfile[] = [];
  const removedColumns: string[] = [];
  const typeChanges: Array<{ column: string; from: string; to: string }> = [];

  for (const [name, afterCol] of afterCols) {
    const beforeCol = beforeCols.get(name);
    if (!beforeCol) {
      addedColumns.push(afterCol);
    } else if (beforeCol.kind !== afterCol.kind) {
      typeChanges.push({ column: name, from: beforeCol.kind, to: afterCol.kind });
    }
  }

  for (const name of beforeCols.keys()) {
    if (!afterCols.has(name)) {
      removedColumns.push(name);
    }
  }

  // Schema is backward-compatible if no columns were removed and no types changed
  const isCompatible = removedColumns.length === 0 && typeChanges.length === 0;

  return { addedColumns, removedColumns, typeChanges, isCompatible };
}
