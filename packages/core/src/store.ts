/**
 * Store interface — abstract durable storage contract.
 * Concrete implementations can persist to JSON files, SQLite, or other backends.
 * All stores are append-friendly and support keyed retrieval.
 */

export interface Store<T> {
  /** Persist a record under a unique key. */
  put(key: string, value: T): Promise<void>;
  /** Retrieve a record by key, or undefined if missing. */
  get(key: string): Promise<T | undefined>;
  /** List all keys in the store. */
  keys(): Promise<string[]>;
  /** List all stored records. */
  all(): Promise<T[]>;
  /** Check if a key exists. */
  has(key: string): Promise<boolean>;
  /** Remove a record by key. Returns true if it existed. */
  delete(key: string): Promise<boolean>;
}
