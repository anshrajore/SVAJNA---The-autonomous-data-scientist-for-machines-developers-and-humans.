import type { MemoryNode, MemoryEdge } from "./memory.js";
import type { Store } from "./store.js";

interface MemoryGraphState {
  nodes: Record<string, MemoryNode>;
  edges: MemoryEdge[];
}

/**
 * Durable analytical memory graph that persists nodes and edges
 * through a Store backend. Replaces the in-memory-only AnalyticalMemory
 * for production use cases.
 */
export class DurableMemory {
  private static readonly KEY = "graph";

  constructor(private readonly store: Store<MemoryGraphState>) {}

  private async load(): Promise<MemoryGraphState> {
    return (await this.store.get(DurableMemory.KEY)) ?? { nodes: {}, edges: [] };
  }

  private async save(state: MemoryGraphState): Promise<void> {
    await this.store.put(DurableMemory.KEY, state);
  }

  async add(node: MemoryNode): Promise<void> {
    const state = await this.load();
    state.nodes[node.id] = node;
    await this.save(state);
  }

  async link(from: string, to: string, relation: string): Promise<void> {
    const state = await this.load();
    if (!state.nodes[from] || !state.nodes[to]) {
      throw new Error("Memory links require known nodes.");
    }
    state.edges.push({ from, to, relation });
    await this.save(state);
  }

  async related(id: string): Promise<MemoryEdge[]> {
    const state = await this.load();
    return state.edges.filter((edge) => edge.from === id || edge.to === id);
  }

  async getNode(id: string): Promise<MemoryNode | undefined> {
    const state = await this.load();
    return state.nodes[id];
  }

  async allNodes(): Promise<MemoryNode[]> {
    const state = await this.load();
    return Object.values(state.nodes);
  }

  async allEdges(): Promise<MemoryEdge[]> {
    const state = await this.load();
    return state.edges;
  }

  async nodeCount(): Promise<number> {
    const state = await this.load();
    return Object.keys(state.nodes).length;
  }
}
