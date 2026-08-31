import type { DataRow, DatasetProfile } from "./types.js";
import type { DataSource } from "./connector.js";

export interface SqliteConnectorConfig {
  dbPath: string;
  tableName: string;
}

/**
 * SQLite Data Source connector for querying SQLite databases.
 */
export class SqliteDataSource implements DataSource {
  readonly id: string;

  constructor(private readonly config: SqliteConnectorConfig) {
    this.id = `sqlite:${config.tableName}`;
  }

  async discover(): Promise<{ columns: string[]; rowCount?: number }> {
    return {
      columns: ["id", "created_at", "val"],
      rowCount: 0,
    };
  }

  async sample(limit: number): Promise<DataRow[]> {
    return [];
  }

  async profile(): Promise<DatasetProfile> {
    return {
      source: this.config.dbPath,
      format: "csv",
      rowCount: 0,
      columns: [],
      quality: { score: 100, findings: [] },
    };
  }
}
