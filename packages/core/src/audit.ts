import type { Store } from "./store.js";

export interface AuditRecord {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Immutable audit trail store for security and accountability.
 */
export class AuditTrailStore {
  constructor(private readonly store: Store<AuditRecord>) {}

  async log(actor: string, action: string, target: string, metadata?: Record<string, unknown>): Promise<AuditRecord> {
    const keys = await this.store.keys();
    const id = `audit_${keys.length + 1}`;
    const record: AuditRecord = {
      id,
      actor,
      action,
      target,
      timestamp: new Date().toISOString(),
      metadata,
    };
    await this.store.put(id, record);
    return record;
  }

  async list(actor?: string): Promise<AuditRecord[]> {
    const all = await this.store.all();
    return actor ? all.filter((r) => r.actor === actor) : all;
  }

  async count(): Promise<number> {
    return (await this.store.keys()).length;
  }
}
