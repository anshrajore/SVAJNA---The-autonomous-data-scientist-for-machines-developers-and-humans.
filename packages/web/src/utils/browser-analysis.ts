export function parseBrowserCsv(text: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse header line
  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    if (!values.length || values.every((v) => v === "")) continue;
    const row: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const raw = values[idx] ?? "";
      row[h] = inferType(raw);
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' || ch === "'") {
      insideQuotes = !insideQuotes;
    } else if (ch === "," && !insideQuotes) {
      result.push(cur.trim().replace(/^["']|["']$/g, ""));
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim().replace(/^["']|["']$/g, ""));
  return result;
}

function inferType(val: string): any {
  if (val === "" || val === "null" || val === "undefined") return null;
  if (val.toLowerCase() === "true") return true;
  if (val.toLowerCase() === "false") return false;
  const num = Number(val);
  if (!isNaN(num) && val.trim() !== "") return num;
  return val;
}

export function profileDataset(source: string, rows: Record<string, any>[]) {
  if (!rows.length) {
    return {
      source,
      rowCount: 0,
      columns: [],
      score: 100,
      stats: {},
      qualityFindings: [],
    };
  }

  const keys = [...new Set(rows.flatMap(Object.keys))];
  let nullCount = 0;
  const stats: Record<string, { min?: number; max?: number; mean?: number; median?: number; distribution?: { label: string; count: number }[] }> = {};

  const columns = keys.map((key) => {
    const values = rows.map((r) => r[key]);
    const present = values.filter((v) => v !== undefined && v !== null && v !== "");
    const missing = values.length - present.length;
    nullCount += missing;

    const sample = present[0];
    const kind = typeof sample === "number" ? "number" : typeof sample === "boolean" ? "boolean" : "string";

    if (kind === "number") {
      const nums = present.map((v) => Number(v)).filter((v) => !isNaN(v)).sort((a, b) => a - b);
      if (nums.length) {
        const min = nums[0]!;
        const max = nums[nums.length - 1]!;
        const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
        const median = nums[Math.floor(nums.length / 2)]!;

        // 5-bucket distribution for histogram
        const buckets = 5;
        const step = (max - min) / buckets || 1;
        const dist: { label: string; count: number }[] = [];
        for (let b = 0; b < buckets; b++) {
          const lower = min + b * step;
          const upper = lower + step;
          const count = nums.filter((n) => (b === buckets - 1 ? n >= lower && n <= upper : n >= lower && n < upper)).length;
          dist.push({ label: `${Math.round(lower)}-${Math.round(upper)}`, count });
        }

        stats[key] = { min, max, mean: Math.round(mean * 100) / 100, median, distribution: dist };
      }
    }

    return {
      name: key,
      kind,
      present: present.length,
      missing,
      distinct: new Set(present).size,
    };
  });

  const totalCells = rows.length * (keys.length || 1);
  const missingRatio = totalCells ? nullCount / totalCells : 0;
  const score = Math.max(0, Math.round(100 - missingRatio * 100));

  const qualityFindings = [];
  if (missingRatio > 0.05) qualityFindings.push(`Dataset has ${(missingRatio * 100).toFixed(1)}% missing values.`);
  if (score > 90) qualityFindings.push("Schema is highly uniform and suitable for deterministic modeling.");

  return {
    source,
    rowCount: rows.length,
    columns,
    score,
    stats,
    qualityFindings,
  };
}

export function diffRows(beforeRows: Record<string, any>[], afterRows: Record<string, any>[], keyColumn: string) {
  const beforeMap = new Map(beforeRows.map((r) => [String(r[keyColumn]), r]));
  const afterMap = new Map(afterRows.map((r) => [String(r[keyColumn]), r]));

  const added: any[] = [];
  const removed: any[] = [];
  const modified: any[] = [];

  for (const [key, afterRow] of afterMap) {
    const beforeRow = beforeMap.get(key);
    if (!beforeRow) {
      added.push(afterRow);
    } else if (JSON.stringify(beforeRow) !== JSON.stringify(afterRow)) {
      modified.push({ before: beforeRow, after: afterRow });
    }
  }

  for (const [key, beforeRow] of beforeMap) {
    if (!afterMap.has(key)) {
      removed.push(beforeRow);
    }
  }

  return { added, removed, modified };
}

export function trainSimpleLinearRegression(rows: Record<string, any>[], xCol: string, yCol: string) {
  const paired: Array<[number, number]> = [];
  for (const r of rows) {
    const x = parseFloat(String(r[xCol]));
    const y = parseFloat(String(r[yCol]));
    if (!isNaN(x) && !isNaN(y)) paired.push([x, y]);
  }

  const n = paired.length || 1;
  const sumX = paired.reduce((acc, p) => acc + p[0], 0);
  const sumY = paired.reduce((acc, p) => acc + p[1], 0);
  const sumXY = paired.reduce((acc, p) => acc + p[0] * p[1], 0);
  const sumX2 = paired.reduce((acc, p) => acc + p[0] ** 2, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const num = sumXY - n * meanX * meanY;
  const den = sumX2 - n * meanX ** 2;

  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 1000) / 1000,
    predict: (x: number) => Math.round((slope * x + intercept) * 1000) / 1000,
  };
}

export function calculateRegressionMetrics(actuals: number[], predictions: number[]) {
  const n = actuals.length;
  if (!n || n !== predictions.length) return { mse: 0, rmse: 0, mae: 0, r2: 0 };
  const errors = actuals.map((act, i) => act - predictions[i]!);
  const mae = errors.reduce((acc, err) => acc + Math.abs(err), 0) / n;
  const mse = errors.reduce((acc, err) => acc + err ** 2, 0) / n;
  const rmse = Math.sqrt(mse);
  const meanActual = actuals.reduce((a, b) => a + b, 0) / n;
  const ssTot = actuals.reduce((acc, act) => acc + (act - meanActual) ** 2, 0);
  const ssRes = errors.reduce((acc, err) => acc + err ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return {
    mse: Math.round(mse * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    mae: Math.round(mae * 100) / 100,
    r2: Math.round(r2 * 1000) / 1000,
  };
}

export function exportDataset(rows: Record<string, any>[], options: { format: "csv" | "json" }) {
  if (options.format === "json") return JSON.stringify(rows, null, 2);
  if (!rows.length) return "";
  const headers = [...new Set(rows.flatMap(Object.keys))];
  const csvLines = [headers.join(",")];
  for (const row of rows) {
    const line = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") ? `"${str}"` : str;
    });
    csvLines.push(line.join(","));
  }
  return csvLines.join("\n");
}
