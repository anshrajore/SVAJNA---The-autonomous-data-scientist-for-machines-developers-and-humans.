export interface MetricSnapshot { metric: string; value: number; capturedAt: string; }
export interface MetricChange { absolute: number; relative: number; changed: boolean; }
export function compareMetric(before: MetricSnapshot, after: MetricSnapshot, threshold = .1): MetricChange { const absolute = after.value - before.value; const relative = before.value === 0 ? (absolute === 0 ? 0 : Infinity) : absolute / before.value; return { absolute, relative, changed: Math.abs(relative) >= threshold }; }
