import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import type { DataRow, Primitive } from "./types.js";

function coerce(value: string): Primitive {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === "true";
  if (/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmed)) return Number(trimmed);
  return trimmed;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { cells.push(cell); cell = ""; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

export function parseCsv(text: string): DataRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("CSV headers must not be empty.");
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, coerce(cells[index] ?? "")]));
  });
}

export async function loadDataset(source: string): Promise<{ format: "csv" | "json"; rows: DataRow[] }> {
  const extension = extname(source).toLowerCase();
  const text = await readFile(source, "utf8");
  if (extension === ".csv") return { format: "csv", rows: parseCsv(text) };
  if (extension === ".json") {
    const parsed: unknown = JSON.parse(text);
    const values = Array.isArray(parsed) ? parsed : [parsed];
    if (!values.every((value) => value !== null && typeof value === "object" && !Array.isArray(value))) {
      throw new Error("JSON must be an object or an array of objects.");
    }
    return { format: "json", rows: values as DataRow[] };
  }
  throw new Error(`Unsupported data format '${extension || "unknown"}'. Use CSV or JSON.`);
}
