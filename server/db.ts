import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  agents, InsertAgent, Agent,
  tasks, InsertTask, Task,
  crews, InsertCrew, Crew,
  executions, InsertExecution, Execution,
  traceLogs, InsertTraceLog, TraceLog,
  tools, InsertTool, Tool,
  metrics, InsertMetric, Metric,
  memoryStore, InsertMemoryStore, MemoryStore,
  trainingData, InsertTrainingData, TrainingData,
  knowledgeBase, InsertKnowledgeBase, KnowledgeBase,
  eventListeners, InsertEventListener, EventListener
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== User Management ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ========== Agent Management ==========
export async function createAgent(agent: InsertAgent): Promise<Agent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(agents).values(agent);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(agents).where(eq(agents.id, Number(insertId)));
  if (!created) throw new Error("Failed to create agent");
  return created;
}

export async function getAgentsByUserId(userId: number): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return agent;
}

export async function updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(agents).set(data).where(eq(agents.id, id));
  return getAgentById(id);
}

export async function deleteAgent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(agents).where(eq(agents.id, id));
}

// ========== Task Management ==========
export async function createTask(task: InsertTask): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tasks).values(task);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(tasks).where(eq(tasks.id, Number(insertId)));
  if (!created) throw new Error("Failed to create task");
  return created;
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return task;
}

export async function updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ========== Crew Management ==========
export async function createCrew(crew: InsertCrew): Promise<Crew> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(crews).values(crew);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(crews).where(eq(crews.id, Number(insertId)));
  if (!created) throw new Error("Failed to create crew");
  return created;
}

export async function getCrewsByUserId(userId: number): Promise<Crew[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(crews).where(eq(crews.userId, userId)).orderBy(desc(crews.createdAt));
}

export async function getCrewById(id: number): Promise<Crew | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [crew] = await db.select().from(crews).where(eq(crews.id, id)).limit(1);
  return crew;
}

export async function updateCrew(id: number, data: Partial<InsertCrew>): Promise<Crew | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(crews).set(data).where(eq(crews.id, id));
  return getCrewById(id);
}

export async function deleteCrew(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(crews).where(eq(crews.id, id));
}

// ========== Execution Management ==========
export async function createExecution(execution: InsertExecution): Promise<Execution> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(executions).values(execution);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(executions).where(eq(executions.id, Number(insertId)));
  if (!created) throw new Error("Failed to create execution");
  return created;
}

export async function getExecutionsByUserId(userId: number): Promise<Execution[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(executions).where(eq(executions.userId, userId)).orderBy(desc(executions.createdAt));
}

export async function getExecutionById(id: number): Promise<Execution | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [execution] = await db.select().from(executions).where(eq(executions.id, id)).limit(1);
  return execution;
}

export async function updateExecution(id: number, data: Partial<InsertExecution>): Promise<Execution | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(executions).set(data).where(eq(executions.id, id));
  return getExecutionById(id);
}

// ========== Trace Log Management ==========
export async function createTraceLog(log: InsertTraceLog): Promise<TraceLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(traceLogs).values(log);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(traceLogs).where(eq(traceLogs.id, Number(insertId)));
  if (!created) throw new Error("Failed to create trace log");
  return created;
}

export async function getTraceLogsByExecutionId(executionId: number): Promise<TraceLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(traceLogs).where(eq(traceLogs.executionId, executionId)).orderBy(traceLogs.timestamp);
}

// ========== Tool Management ==========
export async function createTool(tool: InsertTool): Promise<Tool> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tools).values(tool);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(tools).where(eq(tools.id, Number(insertId)));
  if (!created) throw new Error("Failed to create tool");
  return created;
}

export async function getToolsByUserId(userId: number): Promise<Tool[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(tools).where(eq(tools.userId, userId)).orderBy(desc(tools.createdAt));
}

export async function getToolById(id: number): Promise<Tool | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [tool] = await db.select().from(tools).where(eq(tools.id, id)).limit(1);
  return tool;
}

export async function updateTool(id: number, data: Partial<InsertTool>): Promise<Tool | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(tools).set(data).where(eq(tools.id, id));
  return getToolById(id);
}

export async function deleteTool(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(tools).where(eq(tools.id, id));
}

// ========== Metrics Management ==========
export async function createMetric(metric: InsertMetric): Promise<Metric> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(metrics).values(metric);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    console.error('Insert result:', result);
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(metrics).where(eq(metrics.id, Number(insertId)));
  if (!created) throw new Error("Failed to create metric");
  return created;
}

export async function getMetricsByExecutionId(executionId: number): Promise<Metric[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(metrics).where(eq(metrics.executionId, executionId));
}

// ========== Memory Store Management ==========
export async function createMemory(memory: InsertMemoryStore): Promise<MemoryStore> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(memoryStore).values(memory);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(memoryStore).where(eq(memoryStore.id, Number(insertId)));
  if (!created) throw new Error("Failed to create memory");
  return created;
}

export async function getMemoriesByUserId(userId: number, filters?: {
  crewId?: number;
  agentId?: number;
  executionId?: number;
  memoryType?: "short_term" | "long_term" | "entity";
}): Promise<MemoryStore[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(memoryStore.userId, userId)];
  
  if (filters?.crewId) {
    conditions.push(eq(memoryStore.crewId, filters.crewId));
  }
  if (filters?.agentId) {
    conditions.push(eq(memoryStore.agentId, filters.agentId));
  }
  if (filters?.executionId) {
    conditions.push(eq(memoryStore.executionId, filters.executionId));
  }
  if (filters?.memoryType) {
    conditions.push(eq(memoryStore.memoryType, filters.memoryType));
  }
  
  return db.select().from(memoryStore).where(and(...conditions)).orderBy(desc(memoryStore.createdAt));
}

export async function deleteMemory(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(memoryStore).where(eq(memoryStore.id, id));
}

// ========== Training Data Management ==========
export async function createTrainingData(data: InsertTrainingData): Promise<TrainingData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(trainingData).values(data);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(trainingData).where(eq(trainingData.id, Number(insertId)));
  if (!created) throw new Error("Failed to create training data");
  return created;
}

export async function getTrainingDataByCrewId(crewId: number): Promise<TrainingData[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(trainingData).where(eq(trainingData.crewId, crewId)).orderBy(desc(trainingData.createdAt));
}

export async function updateTrainingData(id: number, data: Partial<InsertTrainingData>): Promise<TrainingData | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(trainingData).set(data).where(eq(trainingData.id, id));
  const [updated] = await db.select().from(trainingData).where(eq(trainingData.id, id)).limit(1);
  return updated;
}

// ========== Knowledge Base Management ==========
export async function createKnowledge(knowledge: InsertKnowledgeBase): Promise<KnowledgeBase> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(knowledgeBase).values(knowledge);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, Number(insertId)));
  if (!created) throw new Error("Failed to create knowledge");
  return created;
}

export async function getKnowledgeByUserId(userId: number, filters?: {
  agentId?: number;
  crewId?: number;
}): Promise<KnowledgeBase[]> {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(knowledgeBase.userId, userId)];
  
  if (filters?.agentId) {
    conditions.push(eq(knowledgeBase.agentId, filters.agentId));
  }
  if (filters?.crewId) {
    conditions.push(eq(knowledgeBase.crewId, filters.crewId));
  }
  
  return db.select().from(knowledgeBase).where(and(...conditions)).orderBy(desc(knowledgeBase.createdAt));
}

export async function updateKnowledge(id: number, data: Partial<InsertKnowledgeBase>): Promise<KnowledgeBase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id));
  const [updated] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id)).limit(1);
  return updated;
}

export async function deleteKnowledge(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
}

// ========== Event Listeners Management ==========
export async function createEventListener(listener: InsertEventListener): Promise<EventListener> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(eventListeners).values(listener);
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error("Failed to get insert ID");
  }
  const [created] = await db.select().from(eventListeners).where(eq(eventListeners.id, Number(insertId)));
  if (!created) throw new Error("Failed to create event listener");
  return created;
}

export async function getEventListenersByCrewId(crewId: number): Promise<EventListener[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(eventListeners).where(eq(eventListeners.crewId, crewId)).orderBy(desc(eventListeners.createdAt));
}

export async function updateEventListener(id: number, data: Partial<InsertEventListener>): Promise<EventListener | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(eventListeners).set(data).where(eq(eventListeners.id, id));
  const [updated] = await db.select().from(eventListeners).where(eq(eventListeners.id, id)).limit(1);
  return updated;
}

export async function deleteEventListener(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(eventListeners).where(eq(eventListeners.id, id));
}
