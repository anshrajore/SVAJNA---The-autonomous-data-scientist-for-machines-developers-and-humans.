import type { DataSource } from "./connector.js";
import type { DataRow, DatasetProfile } from "./types.js";
import { loadDataset } from "./parse.js";
import { profileDataset } from "./profile.js";

/**
 * Connector registry for discovering and managing active data sources in SVAJNA.
 */
export class ConnectorRegistry {
  private readonly sources = new Map<string, DataSource>();

  register(source: DataSource): void {
    if (this.sources.has(source.id)) {
      throw new Error(`Data source '${source.id}' is already registered.`);
    }
    this.sources.set(source.id, source);
  }

  get(id: string): DataSource | undefined {
    return this.sources.get(id);
  }

  list(): DataSource[] {
    return [...this.sources.values()];
  }

  unregister(id: string): boolean {
    return this.sources.delete(id);
  }
}
