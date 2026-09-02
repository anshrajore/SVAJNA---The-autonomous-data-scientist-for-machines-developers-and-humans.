export function parseBrowserCsv(text: string): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  let inQuotes = false;
  let currentField = '';
  let currentRow: string[] = [];
  const rows: string[][] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 1 && row[0] === '') continue; // skip empty lines
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      let val: unknown = row[index] !== undefined ? row[index].trim() : null;
      // Auto-detect type
      if (val !== null && val !== '') {
        const strVal = val as string;
        if (!isNaN(Number(strVal))) {
          val = Number(strVal);
        } else if (strVal.toLowerCase() === 'true') {
          val = true;
        } else if (strVal.toLowerCase() === 'false') {
          val = false;
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(strVal) && !isNaN(Date.parse(strVal))) {
          val = strVal; 
        }
      }
      obj[header] = val;
    });
    result.push(obj);
  }

  return result;
}

export function inferColumnTypes(rows: Record<string, unknown>[]): { name: string; type: 'number' | 'string' | 'boolean' | 'date'; sample: unknown }[] {
  if (!rows || rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  
  return headers.map(name => {
    let type: 'number' | 'string' | 'boolean' | 'date' = 'string';
    let sample = null;
    
    for (const row of rows) {
      const val = row[name];
      if (val !== null && val !== undefined && val !== '') {
        sample = val;
        if (typeof val === 'number') type = 'number';
        else if (typeof val === 'boolean') type = 'boolean';
        else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && !isNaN(Date.parse(val))) type = 'date';
        break;
      }
    }
    
    return { name, type, sample };
  });
}

export function getNumericColumns(rows: Record<string, unknown>[]): string[] {
  return inferColumnTypes(rows).filter(c => c.type === 'number').map(c => c.name);
}

export function getCategoricalColumns(rows: Record<string, unknown>[]): string[] {
  return inferColumnTypes(rows).filter(c => c.type === 'string' || c.type === 'boolean').map(c => c.name);
}

export function exportAsCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [];
  
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  
  for (const row of rows) {
    const values = headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const strVal = String(val);
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export function exportAsJson(rows: Record<string, unknown>[]): string {
  return JSON.stringify(rows, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

