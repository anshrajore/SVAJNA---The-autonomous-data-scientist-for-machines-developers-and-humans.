import type { ColumnKind, ColumnProfile, DataRow, DatasetProfile, Primitive, QualityFinding } from "./types.js";

function classify(values: Primitive[]): ColumnKind {
  const nonNull = values.filter((value) => value !== null);
  if (nonNull.length === 0) return "unknown";
  if (nonNull.every((value) => typeof value === "number")) return "number";
  if (nonNull.every((value) => typeof value === "boolean")) return "boolean";
  if (nonNull.every((value) => typeof value === "string") && nonNull.every((value) => !Number.isNaN(Date.parse(value as string)))) return "date";
  return "string";
}

function profileColumn(name: string, values: Primitive[]): ColumnProfile {
  const kind = classify(values);
  const present = values.filter((value) => value !== null).length;
  const unique = new Set(values.filter((value) => value !== null).map(String));
  const column: ColumnProfile = { name, kind, present, missing: values.length - present, distinct: unique.size, sample: values.filter((value) => value !== null).slice(0, 5) };
  if (kind === "number") {
    const numbers = values.filter((value): value is number => typeof value === "number");
    column.min = Math.min(...numbers); column.max = Math.max(...numbers);
    column.mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }
  if (kind === "date") {
    const dates = values.filter((value): value is string => typeof value === "string").sort();
    column.min = dates[0]; column.max = dates.at(-1);
  }
  return column;
}

export function profileDataset(source: string, format: "csv" | "json", rows: DataRow[]): DatasetProfile {
  const names = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const columns = names.map((name) => profileColumn(name, rows.map((row) => row[name] ?? null)));
  const findings: QualityFinding[] = [];
  if (rows.length === 0) findings.push({ severity: "warning", code: "EMPTY_DATASET", message: "The dataset has no rows." });
  for (const column of columns) {
    if (column.missing > 0) findings.push({ severity: "warning", code: "MISSING_VALUES", column: column.name, message: `${column.missing} of ${rows.length} values are missing.` });
    if (rows.length > 20 && column.distinct / rows.length > 0.95) findings.push({ severity: "info", code: "HIGH_CARDINALITY", column: column.name, message: "Column is nearly unique and may be an identifier." });
  }
  const duplicateCount = rows.length - new Set(rows.map((row) => JSON.stringify(Object.keys(row).sort().map((key) => [key, row[key]])))).size;
  if (duplicateCount > 0) findings.push({ severity: "warning", code: "DUPLICATE_ROWS", message: `${duplicateCount} duplicate row${duplicateCount === 1 ? "" : "s"} detected.` });
  const penalty = findings.reduce((sum, finding) => sum + (finding.severity === "warning" ? 8 : 1), 0);
  return { source, format, rowCount: rows.length, columns, quality: { score: Math.max(0, 100 - penalty), findings } };
}
