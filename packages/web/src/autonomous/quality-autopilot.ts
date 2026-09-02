export interface DataQualityIssue {
  id: string;
  type: 'missing_values' | 'outliers' | 'duplicates' | 'high_cardinality' | 'schema_inconsistency';
  column: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedRows: number;
  impactPct: number;
  recommendedTransformation: {
    what: string;
    why: string;
    impact: string;
    confidence: number;
    action: 'impute_mean' | 'cap_iqr' | 'drop_duplicates' | 'one_hot_encode';
  };
  status: 'pending' | 'accepted' | 'rejected';
}

export function detectQualityIssues(rows: Record<string, unknown>[]): DataQualityIssue[] {
  if (!rows || rows.length === 0) return [];
  const issues: DataQualityIssue[] = [];
  const keys = Object.keys(rows[0]);
  const rowCount = rows.length;

  keys.forEach((key) => {
    const rawVals = rows.map((r) => r[key]);
    const missing = rawVals.filter((v) => v === null || v === undefined || v === '').length;
    const missingPct = (missing / rowCount) * 100;

    if (missing > 0) {
      issues.push({
        id: `missing_${key}`,
        type: 'missing_values',
        column: key,
        severity: missingPct > 15 ? 'high' : 'medium',
        description: `Column '${key}' contains ${missing} missing entries (${missingPct.toFixed(1)}%).`,
        affectedRows: missing,
        impactPct: missingPct,
        recommendedTransformation: {
          what: `Impute missing values in '${key}' using column median strategy.`,
          why: `${missing} values were absent in raw ingestion layer.`,
          impact: `Reduces missingness ratio from ${missingPct.toFixed(1)}% to 0.0%.`,
          confidence: 0.94,
          action: 'impute_mean',
        },
        status: 'pending',
      });
    }

    const numVals = rawVals.map(Number).filter((v) => !isNaN(v)).sort((a, b) => a - b);
    if (numVals.length > 5) {
      const q1 = numVals[Math.floor(numVals.length * 0.25)]!;
      const q3 = numVals[Math.floor(numVals.length * 0.75)]!;
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      const outliers = numVals.filter((v) => v < lower || v > upper).length;
      const outlierPct = (outliers / numVals.length) * 100;

      if (outliers > 0) {
        issues.push({
          id: `outlier_${key}`,
          type: 'outliers',
          column: key,
          severity: outlierPct > 10 ? 'high' : 'low',
          description: `Column '${key}' has ${outliers} extreme numerical outliers beyond 1.5× IQR boundary.`,
          affectedRows: outliers,
          impactPct: outlierPct,
          recommendedTransformation: {
            what: `Cap extreme values in '${key}' to IQR upper [${upper.toFixed(1)}] and lower [${lower.toFixed(1)}] bounds.`,
            why: `Outliers can distort model gradients and variance estimation.`,
            impact: `Constrains variance while retaining sample count of ${rowCount} rows.`,
            confidence: 0.91,
            action: 'cap_iqr',
          },
          status: 'pending',
        });
      }
    }
  });

  return issues;
}
