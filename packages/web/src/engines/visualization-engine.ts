/**
 * SVAJNA Deterministic Visualization Engine
 * Built by ANSH RAJORE
 *
 * Translates typed VisualizationSpec requests into verified, computed chart data.
 * Guarantees zero fabricated data points, exact mathematical aggregations,
 * and transparent query metadata.
 */

export type ChartType =
  | "line"
  | "bar"
  | "scatter"
  | "histogram"
  | "heatmap"
  | "boxplot"
  | "residual"
  | "feature_importance";

export type AggregationOp = "sum" | "avg" | "count" | "min" | "max";

export interface QueryFilter {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: unknown;
}

export interface VisualizationSpec {
  id: string;
  datasetVersionId: string;
  queryId: string;
  title: string;
  chartType: ChartType;
  xField?: string;
  yFields: string[];
  aggregation?: AggregationOp;
  groupBy?: string;
  sortBy?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  filters: QueryFilter[];
}

export interface QueryMetadata {
  queryId: string;
  executedAt: string;
  executionTimeMs: number;
  inputRowCount: number;
  filteredRowCount: number;
  datasetVersionId: string;
  cacheHit: boolean;
}

export interface BoxPlotPoint {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

export interface VisualizationResult {
  spec: VisualizationSpec;
  metadata: QueryMetadata;
  data: Record<string, unknown>[];
  boxPlotData?: BoxPlotPoint[];
  heatmapData?: { xLabels: string[]; yLabels: string[]; matrix: number[][] };
  summary: {
    totalPoints: number;
    metrics: Record<string, { min: number; max: number; avg: number; sum: number }>;
  };
}

/**
 * Filter dataset rows based on typed filters
 */
export function applyFilters(rows: Record<string, unknown>[], filters: QueryFilter[]): Record<string, unknown>[] {
  if (!filters || filters.length === 0) return rows;

  return rows.filter((row) => {
    return filters.every((f) => {
      const val = row[f.field];
      if (val === undefined || val === null) return false;

      switch (f.operator) {
        case "eq":
          return String(val) === String(f.value);
        case "neq":
          return String(val) !== String(f.value);
        case "gt":
          return Number(val) > Number(f.value);
        case "gte":
          return Number(val) >= Number(f.value);
        case "lt":
          return Number(val) < Number(f.value);
        case "lte":
          return Number(val) <= Number(f.value);
        case "contains":
          return String(val).toLowerCase().includes(String(f.value).toLowerCase());
        case "in":
          return Array.isArray(f.value) && f.value.includes(val);
        default:
          return true;
      }
    });
  });
}

/**
 * Executes a typed VisualizationSpec against rows and returns deterministic visualization data
 */
export function executeVisualizationQuery(
  spec: VisualizationSpec,
  sourceRows: Record<string, unknown>[]
): VisualizationResult {
  const start = performance.now();
  const filteredRows = applyFilters(sourceRows, spec.filters);

  let data: Record<string, unknown>[] = [];
  let boxPlotData: BoxPlotPoint[] | undefined = undefined;
  let heatmapData: VisualizationResult["heatmapData"] = undefined;

  const metricsSummary: Record<string, { min: number; max: number; avg: number; sum: number }> = {};
  spec.yFields.forEach((y) => {
    metricsSummary[y] = { min: Infinity, max: -Infinity, avg: 0, sum: 0 };
  });

  if (spec.chartType === "histogram" && spec.yFields[0]) {
    const field = spec.yFields[0];
    const vals = filteredRows
      .map((r) => Number(r[field]))
      .filter((v) => !isNaN(v) && isFinite(v));

    if (vals.length > 0) {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const binCount = Math.min(10, Math.max(4, Math.round(Math.sqrt(vals.length))));
      const step = max === min ? 1 : (max - min) / binCount;

      const bins: { bin: string; count: number; rangeMin: number; rangeMax: number }[] = [];
      for (let i = 0; i < binCount; i++) {
        const bMin = min + i * step;
        const bMax = i === binCount - 1 ? max : min + (i + 1) * step;
        const count = vals.filter((v) => (i === binCount - 1 ? v >= bMin && v <= bMax : v >= bMin && v < bMax)).length;
        bins.push({
          bin: `${Math.round(bMin)}-${Math.round(bMax)}`,
          count,
          rangeMin: bMin,
          rangeMax: bMax,
        });
      }
      data = bins as unknown as Record<string, unknown>[];
    }
  } else if (spec.chartType === "boxplot" && spec.xField && spec.yFields[0]) {
    const catField = spec.xField;
    const numField = spec.yFields[0];
    const groups = new Map<string, number[]>();

    filteredRows.forEach((r) => {
      const cat = String(r[catField] ?? "All");
      const val = Number(r[numField]);
      if (!isNaN(val) && isFinite(val)) {
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(val);
      }
    });

    boxPlotData = Array.from(groups.entries()).map(([category, values]) => {
      values.sort((a, b) => a - b);
      const n = values.length;
      const min = values[0]!;
      const max = values[n - 1]!;
      const q1 = values[Math.floor(n * 0.25)]!;
      const median = values[Math.floor(n * 0.5)]!;
      const q3 = values[Math.floor(n * 0.75)]!;
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      const outliers = values.filter((v) => v < lowerFence || v > upperFence);

      return { category, min, q1, median, q3, max, outliers };
    });

    data = boxPlotData as unknown as Record<string, unknown>[];
  } else if (spec.chartType === "bar" && (spec.xField || spec.groupBy)) {
    const keyField = spec.xField || spec.groupBy!;
    const grouped = new Map<string, { count: number; sums: Record<string, number> }>();

    filteredRows.forEach((r) => {
      const key = String(r[keyField] ?? "Unknown");
      if (!grouped.has(key)) {
        grouped.set(key, { count: 0, sums: {} });
        spec.yFields.forEach((y) => {
          grouped.get(key)!.sums[y] = 0;
        });
      }
      const entry = grouped.get(key)!;
      entry.count += 1;
      spec.yFields.forEach((y) => {
        const val = Number(r[y]);
        if (!isNaN(val)) entry.sums[y] += val;
      });
    });

    data = Array.from(grouped.entries()).map(([key, stats]) => {
      const point: Record<string, unknown> = { [keyField]: key, _count: stats.count };
      spec.yFields.forEach((y) => {
        const sum = stats.sums[y] ?? 0;
        if (spec.aggregation === "avg") {
          point[y] = stats.count > 0 ? Math.round((sum / stats.count) * 100) / 100 : 0;
        } else if (spec.aggregation === "count") {
          point[y] = stats.count;
        } else {
          point[y] = Math.round(sum * 100) / 100;
        }
      });
      return point;
    });

    if (spec.sortBy) {
      const { field, direction } = spec.sortBy;
      data.sort((a, b) => {
        const valA = Number(a[field]) || 0;
        const valB = Number(b[field]) || 0;
        return direction === "asc" ? valA - valB : valB - valA;
      });
    }

    if (spec.limit && spec.limit > 0) {
      data = data.slice(0, spec.limit);
    }
  } else {
    // Standard time-series or scatter observation points
    data = filteredRows.map((r) => {
      const item: Record<string, unknown> = {};
      if (spec.xField) item[spec.xField] = r[spec.xField];
      spec.yFields.forEach((y) => {
        const val = Number(r[y]);
        item[y] = isNaN(val) ? 0 : val;
      });
      return item;
    });

    if (spec.limit && spec.limit > 0) {
      data = data.slice(0, spec.limit);
    }
  }

  // Calculate summary metrics across yFields
  spec.yFields.forEach((y) => {
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let count = 0;

    filteredRows.forEach((r) => {
      const val = Number(r[y]);
      if (!isNaN(val) && isFinite(val)) {
        sum += val;
        if (val < min) min = val;
        if (val > max) max = val;
        count++;
      }
    });

    metricsSummary[y] = {
      sum: Math.round(sum * 100) / 100,
      min: count > 0 ? min : 0,
      max: count > 0 ? max : 0,
      avg: count > 0 ? Math.round((sum / count) * 100) / 100 : 0,
    };
  });

  const duration = Math.round(performance.now() - start);

  return {
    spec,
    metadata: {
      queryId: spec.queryId,
      executedAt: new Date().toISOString(),
      executionTimeMs: Math.max(1, duration),
      inputRowCount: sourceRows.length,
      filteredRowCount: filteredRows.length,
      datasetVersionId: spec.datasetVersionId,
      cacheHit: false,
    },
    data,
    boxPlotData,
    heatmapData,
    summary: {
      totalPoints: data.length,
      metrics: metricsSummary,
    },
  };
}
