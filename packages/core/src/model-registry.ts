import type { DataRow } from "./types.js";

export interface ModelRegistryRecord {
  id: string;
  name: string;
  type: string;
  version: number;
  metrics: Record<string, number>;
  createdAt: string;
}

/**
 * Model Registry for tracking analytical model artifacts and performance.
 */
export class ModelRegistry {
  private readonly models = new Map<string, ModelRegistryRecord>();

  register(record: Omit<ModelRegistryRecord, "createdAt">): ModelRegistryRecord {
    const full: ModelRegistryRecord = {
      ...record,
      createdAt: new Date().toISOString(),
    };
    this.models.set(record.id, full);
    return full;
  }

  get(id: string): ModelRegistryRecord | undefined {
    return this.models.get(id);
  }

  list(): ModelRegistryRecord[] {
    return [...this.models.values()];
  }
}
