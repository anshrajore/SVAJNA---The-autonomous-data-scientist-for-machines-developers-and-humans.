import type { DataRow, DatasetProfile } from "./types.js";

/** Provider-neutral data access contract; concrete cloud connectors belong outside core. */
export interface DataSource {
  readonly id: string;
  discover(): Promise<{ columns: string[]; rowCount?: number }>;
  sample(limit: number): Promise<DataRow[]>;
  profile(): Promise<DatasetProfile>;
}

export class InMemoryDataSource implements DataSource {
  constructor(readonly id: string, private readonly rows: DataRow[], private readonly createProfile: () => DatasetProfile) {}
  async discover() { return { columns: [...new Set(this.rows.flatMap(Object.keys))], rowCount: this.rows.length }; }
  async sample(limit: number) { return this.rows.slice(0, Math.max(0, limit)); }
  async profile() { return this.createProfile(); }
}
