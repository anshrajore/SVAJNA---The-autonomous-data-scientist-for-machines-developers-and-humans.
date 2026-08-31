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
