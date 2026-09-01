export function profileDataset(source: string, rows: Record<string, any>[]) {
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const columns = keys.map((key) => {
    const values = rows.map((r) => r[key]).filter((v) => v !== undefined && v !== null);
    const sample = values[0];
    const kind = typeof sample === "number" ? "number" : typeof sample === "boolean" ? "boolean" : "string";
    return {
      name: key,
      kind,
      present: values.length,
      distinct: new Set(values).size,
    };
  });

  return {
    source,
    rowCount: rows.length,
    columns,
    score: 100,
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
    slope,
    intercept,
    predict: (x: number) => slope * x + intercept,
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
  return { mse, rmse, mae, r2 };
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
