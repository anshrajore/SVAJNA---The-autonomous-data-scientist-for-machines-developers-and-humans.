import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Store } from "./store.js";

/**
 * JSON file-backed store. Each store instance manages a single JSON file
 * containing a key-value map. Suitable for local-first persistence of
 * events, memory, workflows, and approvals.
 */
export class JsonFileStore<T> implements Store<T> {
  private cache: Map<string, T> | null = null;

  constructor(private readonly filePath: string) {}

  private async load(): Promise<Map<string, T>> {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.filePath, "utf8");
      const data = JSON.parse(raw) as Record<string, T>;
      this.cache = new Map(Object.entries(data));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        this.cache = new Map();
      } else {
        throw error;
      }
    }
    return this.cache!;
  }

  private async flush(): Promise<void> {
    if (!this.cache) return;
    await mkdir(dirname(this.filePath), { recursive: true });
    const obj: Record<string, T> = {};
    for (const [key, value] of this.cache) obj[key] = value;
    await writeFile(this.filePath, JSON.stringify(obj, null, 2), "utf8");
  }

  async put(key: string, value: T): Promise<void> {
    const map = await this.load();
    map.set(key, value);
    await this.flush();
  }

  async get(key: string): Promise<T | undefined> {
    const map = await this.load();
    return map.get(key);
  }

  async keys(): Promise<string[]> {
    const map = await this.load();
    return [...map.keys()];
  }

  async all(): Promise<T[]> {
    const map = await this.load();
    return [...map.values()];
  }

  async has(key: string): Promise<boolean> {
    const map = await this.load();
    return map.has(key);
  }

  async delete(key: string): Promise<boolean> {
    const map = await this.load();
    const existed = map.delete(key);
    if (existed) await this.flush();
    return existed;
  }
}
