import type { DomainEvent } from "./events.js";
import type { Store } from "./store.js";

/**
 * Durable event store that persists domain events through a Store backend.
 * Wraps the in-memory EventStore pattern with file-backed persistence.
 */
export class DurableEventStore {
  constructor(private readonly store: Store<DomainEvent>) {}

  async append<T>(type: string, payload: T, now = new Date()): Promise<DomainEvent<T>> {
    const keys = await this.store.keys();
    const id = `${type}_${keys.length + 1}`;
    const event: DomainEvent<T> = {
      id,
      type,
      occurredAt: now.toISOString(),
      payload,
    };
    await this.store.put(id, event);
    return event;
  }

  async list(type?: string): Promise<DomainEvent[]> {
    const all = await this.store.all();
    return type ? all.filter((event) => event.type === type) : all;
  }

  async get(id: string): Promise<DomainEvent | undefined> {
    return this.store.get(id);
  }

  async count(): Promise<number> {
    const keys = await this.store.keys();
    return keys.length;
  }
}
