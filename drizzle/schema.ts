import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * ユーザーテーブル
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * エージェントテーブル
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: text("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory").notNull(),
  tools: json("tools").$type<string[]>(),
  allowDelegation: boolean("allowDelegation").default(true).notNull(),
  verbose: boolean("verbose").default(false).notNull(),
  llmConfig: json("llmConfig").$type<Record<string, unknown>>(),
  
  // CrewAI完全機能: Agent設定
  maxIter: int("maxIter").default(15).notNull(), // 最大試行回数
  maxRpm: int("maxRpm").default(10), // 1分あたりの最大リクエスト数
  maxRetryLimit: int("maxRetryLimit").default(2).notNull(), // 失敗時の再試行回数
  respectContextWindow: boolean("respectContextWindow").default(true).notNull(), // コンテキストウィンドウを尊重
  codeExecutionMode: mysqlEnum("codeExecutionMode", ["safe", "unsafe"]).default("safe"), // コード実行モード
  
  // CrewAI完全機能: Memory設定
  memory: boolean("memory").default(false).notNull(), // エージェント固有のメモリを有効化
  memoryConfig: json("memoryConfig").$type<{
    shortTerm?: boolean;
    longTerm?: boolean;
    entity?: boolean;
  }>(),
  
  // CrewAI完全機能: Knowledge設定
  knowledgeSources: json("knowledgeSources").$type<string[]>(), // ナレッジソース（ファイルパスやURL）
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * タスクテーブル
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  expectedOutput: text("expectedOutput"),
  agentId: int("agentId"),
  
  // CrewAI完全機能: Task Dependencies
  context: json("context").$type<number[]>(), // 依存タスクのID配列
  
  // CrewAI完全機能: Output Validation
  outputPydantic: json("outputPydantic").$type<Record<string, unknown>>(), // Pydanticモデル（JSON Schema）
  outputFile: varchar("outputFile", { length: 512 }), // 出力ファイルパス
  
  // CrewAI完全機能: Human Input
  humanInput: boolean("humanInput").default(false).notNull(), // 実行前に人間の承認を要求
  
  // CrewAI完全機能: Callbacks
  callbackConfig: json("callbackConfig").$type<{
    onStart?: string; // コールバック関数名
    onComplete?: string;
    onError?: string;
  }>(),
  
  asyncExecution: boolean("asyncExecution").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * クルーテーブル
 */
export const crews = mysqlTable("crews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // CrewAI完全機能: Process Types
  process: mysqlEnum("process", ["sequential", "hierarchical", "consensual"]).default("sequential").notNull(),
  
  verbose: boolean("verbose").default(false).notNull(),
  agentIds: json("agentIds").$type<number[]>(),
  taskIds: json("taskIds").$type<number[]>(),
  managerLlmConfig: json("managerLlmConfig").$type<Record<string, unknown>>(),
  
  // CrewAI完全機能: Memory設定
  memory: boolean("memory").default(false).notNull(), // クルー全体のメモリを有効化
  memoryConfig: json("memoryConfig").$type<{
    shortTerm?: boolean;
    longTerm?: boolean;
    entity?: boolean;
    embedderProvider?: string; // "openai", "anthropic", "google", "cohere"
    embedderModel?: string;
  }>(),
  
  // CrewAI完全機能: Planning設定
  planning: boolean("planning").default(false).notNull(), // 実行前の自動プランニング
  planningLlmConfig: json("planningLlmConfig").$type<Record<string, unknown>>(),
  
  // CrewAI完全機能: Callbacks
  stepCallback: varchar("stepCallback", { length: 255 }), // ステップコールバック関数名
  taskCallback: varchar("taskCallback", { length: 255 }), // タスクコールバック関数名
  
  // CrewAI完全機能: Max Iterations
  maxIter: int("maxIter").default(15).notNull(), // クルー全体の最大試行回数
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Crew = typeof crews.$inferSelect;
export type InsertCrew = typeof crews.$inferInsert;

/**
 * 実行履歴テーブル
 */
export const executions = mysqlTable("executions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crewId: int("crewId").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "awaiting_approval"]).default("pending").notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  
  // CrewAI完全機能: Human-in-the-loop
  awaitingApprovalTaskId: int("awaitingApprovalTaskId"), // 承認待ちのタスクID
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]),
  
  // CrewAI完全機能: Planning結果
  plan: json("plan").$type<Array<{
    taskId: number;
    description: string;
    dependencies: number[];
  }>>(),
  
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = typeof executions.$inferInsert;

/**
 * トレーシングログテーブル
 */
export const traceLogs = mysqlTable("traceLogs", {
  id: int("id").autoincrement().primaryKey(),
  executionId: int("executionId").notNull(),
  agentId: int("agentId"),
  taskId: int("taskId"),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  message: text("message").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TraceLog = typeof traceLogs.$inferSelect;
export type InsertTraceLog = typeof traceLogs.$inferInsert;

/**
 * ツールリポジトリテーブル
 */
export const tools = mysqlTable("tools", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["builtin", "custom", "mcp"]).default("custom").notNull(),
  description: text("description"),
  config: json("config").$type<Record<string, unknown>>(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

/**
 * パフォーマンスメトリクステーブル
 */
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  executionId: int("executionId").notNull(),
  tokenUsage: int("tokenUsage").default(0).notNull(),
  executionTime: int("executionTime").default(0).notNull(),
  cost: int("cost").default(0).notNull(),
  successRate: int("successRate").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

/**
 * CrewAI完全機能: Memory Storeテーブル
 * Short-term, Long-term, Entity memoryのデータを保存
 */
export const memoryStore = mysqlTable("memoryStore", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crewId: int("crewId"), // クルー固有のメモリ
  agentId: int("agentId"), // エージェント固有のメモリ
  executionId: int("executionId"), // 実行固有のメモリ
  
  memoryType: mysqlEnum("memoryType", ["short_term", "long_term", "entity"]).notNull(),
  
  // Short-term memory: 現在の実行コンテキスト
  // Long-term memory: 過去の実行結果
  // Entity memory: エンティティ情報
  content: text("content").notNull(),
  
  // RAG用のembedding（JSON形式で保存）
  embedding: json("embedding").$type<number[]>(),
  
  // Entity memory用のメタデータ
  entityType: varchar("entityType", { length: 64 }), // "person", "place", "concept"
  entityName: varchar("entityName", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Short-term memoryの有効期限
});

export type MemoryStore = typeof memoryStore.$inferSelect;
export type InsertMemoryStore = typeof memoryStore.$inferInsert;

/**
 * CrewAI完全機能: Training Dataテーブル
 * 実行履歴からの学習データを保存
 */
export const trainingData = mysqlTable("trainingData", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crewId: int("crewId").notNull(),
  executionId: int("executionId").notNull(),
  
  // 入力・出力・フィードバック
  input: text("input").notNull(),
  output: text("output").notNull(),
  feedback: text("feedback"), // 人間のフィードバック
  rating: int("rating"), // 1-5の評価
  
  // 学習用のメタデータ
  taskResults: json("taskResults").$type<Array<{
    taskId: number;
    output: string;
    success: boolean;
  }>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingData = typeof trainingData.$inferSelect;
export type InsertTrainingData = typeof trainingData.$inferInsert;

/**
 * CrewAI完全機能: Knowledge Baseテーブル
 * ナレッジソースを保存
 */
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"), // エージェント固有のナレッジ
  crewId: int("crewId"), // クルー固有のナレッジ
  
  sourceType: mysqlEnum("sourceType", ["file", "url", "text"]).notNull(),
  sourcePath: text("sourcePath"), // ファイルパスまたはURL
  content: text("content"), // テキストコンテンツ
  
  // RAG用のembedding
  embedding: json("embedding").$type<number[]>(),
  
  // メタデータ
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

/**
 * CrewAI完全機能: Event Listenersテーブル
 * イベントリスナーの設定を保存
 */
export const eventListeners = mysqlTable("eventListeners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  crewId: int("crewId").notNull(),
  
  eventType: varchar("eventType", { length: 64 }).notNull(), // "task_start", "task_complete", "agent_action", etc.
  callbackFunction: varchar("callbackFunction", { length: 255 }).notNull(), // コールバック関数名
  
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventListener = typeof eventListeners.$inferSelect;
export type InsertEventListener = typeof eventListeners.$inferInsert;
