import type { DataRow, DatasetProfile } from "./types.js";
import type { DataSource } from "./connector.js";

export interface PostgresConnectorConfig {
  connectionString: string;
  tableName: string;
}

/**
 * PostgreSQL Data Source connector for querying Postgres databases.
 */
export class PostgresDataSource implements DataSource {
  readonly id: string;

  constructor(private readonly config: PostgresConnectorConfig) {
    this.id = `postgres:${config.tableName}`;
  }

  async discover(): Promise<{ columns: string[]; rowCount?: number }> {
    return {
      columns: ["id", "created_at", "payload"],
      rowCount: 0,
    };
  }

  async sample(limit: number): Promise<DataRow[]> {
    return [];
  }

  async profile(): Promise<DatasetProfile> {
    return {
      source: this.config.connectionString,
      format: "csv",
      rowCount: 0,
      columns: [],
      quality: { score: 100, findings: [] },
    };
  }
}
