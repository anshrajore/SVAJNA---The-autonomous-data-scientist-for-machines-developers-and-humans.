const sensitive = /password|secret|token|api[_-]?key|email/i;
export function redactRecord(record: Record<string, unknown>): Record<string, unknown> { return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, sensitive.test(key) ? "[REDACTED]" : value])); }
