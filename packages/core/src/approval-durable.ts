import type { ApprovalRequest } from "./approval.js";
import { requestApproval, resolveApproval } from "./approval.js";
import type { Store } from "./store.js";

/**
 * Durable approval store. Persists approval request lifecycle
 * (pending → approved/rejected) through a Store backend.
 */
export class DurableApprovalStore {
  constructor(private readonly store: Store<ApprovalRequest>) {}

  async request(id: string, action: string): Promise<ApprovalRequest> {
    const approval = requestApproval(id, action);
    await this.store.put(id, approval);
    return approval;
  }

  async resolve(id: string, approved: boolean): Promise<ApprovalRequest> {
    const existing = await this.store.get(id);
    if (!existing) throw new Error(`Approval '${id}' not found.`);
    const resolved = resolveApproval(existing, approved);
    await this.store.put(id, resolved);
    return resolved;
  }

  async get(id: string): Promise<ApprovalRequest | undefined> {
    return this.store.get(id);
  }

  async pending(): Promise<ApprovalRequest[]> {
    const all = await this.store.all();
    return all.filter((a) => a.status === "pending");
  }

  async list(): Promise<ApprovalRequest[]> {
    return this.store.all();
  }
}
