import type { WorkflowStep } from "./workflow.js";
import type { Store } from "./store.js";

export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface WorkflowRecord {
  id: string;
  steps: WorkflowStep[];
  plan: string[];
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
}

/**
 * Durable workflow store. Tracks workflow definitions, execution plans,
 * and step completion state through a file-backed Store.
 */
export class DurableWorkflowStore {
  constructor(private readonly store: Store<WorkflowRecord>) {}

  async create(id: string, steps: WorkflowStep[], plan: string[]): Promise<WorkflowRecord> {
    const now = new Date().toISOString();
    const record: WorkflowRecord = {
      id,
      steps,
      plan,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      completedSteps: [],
    };
    await this.store.put(id, record);
    return record;
  }

  async markRunning(id: string): Promise<void> {
    const record = await this.store.get(id);
    if (!record) throw new Error(`Workflow '${id}' not found.`);
    record.status = "running";
    record.updatedAt = new Date().toISOString();
    await this.store.put(id, record);
  }

  async completeStep(id: string, stepId: string): Promise<void> {
    const record = await this.store.get(id);
    if (!record) throw new Error(`Workflow '${id}' not found.`);
    if (!record.completedSteps.includes(stepId)) {
      record.completedSteps.push(stepId);
    }
    if (record.completedSteps.length === record.plan.length) {
      record.status = "completed";
    }
    record.updatedAt = new Date().toISOString();
    await this.store.put(id, record);
  }

  async failStep(id: string, stepId: string, error: string): Promise<void> {
    const record = await this.store.get(id);
    if (!record) throw new Error(`Workflow '${id}' not found.`);
    record.status = "failed";
    record.failedStep = stepId;
    record.error = error;
    record.updatedAt = new Date().toISOString();
    await this.store.put(id, record);
  }

  async get(id: string): Promise<WorkflowRecord | undefined> {
    return this.store.get(id);
  }

  async list(): Promise<WorkflowRecord[]> {
    return this.store.all();
  }
}
