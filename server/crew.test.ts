import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("crew API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a crew with agents and tasks", async () => {
    // エージェントを作成
    const agent1 = await caller.agent.create({
      name: "リサーチャー",
      role: "研究者",
      goal: "情報を収集する",
      backstory: "経験豊富な研究者",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    const agent2 = await caller.agent.create({
      name: "ライター",
      role: "執筆者",
      goal: "レポートを作成する",
      backstory: "プロのライター",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    // タスクを作成
    const task1 = await caller.task.create({
      name: "調査タスク",
      description: "市場調査を行う",
      expectedOutput: "調査結果",
      agentId: agent1.id,
    });

    const task2 = await caller.task.create({
      name: "執筆タスク",
      description: "レポートを執筆する",
      expectedOutput: "完成したレポート",
      agentId: agent2.id,
    });

    // クルーを作成
    const crew = await caller.crew.create({
      name: "マーケティングクルー",
      description: "市場調査とレポート作成を行うクルー",
      process: "sequential",
      agentIds: [agent1.id, agent2.id],
      taskIds: [task1.id, task2.id],
    });

    expect(crew).toHaveProperty("id");
    expect(crew.name).toBe("マーケティングクルー");
    expect(crew.process).toBe("sequential");
    expect(crew.agentIds).toEqual([agent1.id, agent2.id]);
    expect(crew.taskIds).toEqual([task1.id, task2.id]);
  });

  it("should list crews", async () => {
    const result = await caller.crew.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get crew by id", async () => {
    // エージェントとタスクを作成
    const agent = await caller.agent.create({
      name: "テストエージェント",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    const task = await caller.task.create({
      name: "テストタスク",
      description: "テストを実行する",
      expectedOutput: "テスト結果",
      agentId: agent.id,
    });

    // クルーを作成
    const created = await caller.crew.create({
      name: "取得テスト",
      description: "テスト用クルー",
      process: "sequential",
      agentIds: [agent.id],
      taskIds: [task.id],
    });

    // 作成したクルーを取得
    const result = await caller.crew.get({ id: created.id });

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe("取得テスト");
  });

  it("should update a crew", async () => {
    // エージェントとタスクを作成
    const agent = await caller.agent.create({
      name: "テストエージェント",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    const task = await caller.task.create({
      name: "テストタスク",
      description: "テストを実行する",
      expectedOutput: "テスト結果",
      agentId: agent.id,
    });

    // クルーを作成
    const created = await caller.crew.create({
      name: "更新前",
      description: "テスト用クルー",
      process: "sequential",
      agentIds: [agent.id],
      taskIds: [task.id],
    });

    // クルーを更新
    const updated = await caller.crew.update({
      id: created.id,
      name: "更新後",
      process: "hierarchical",
    });

    expect(updated.name).toBe("更新後");
    expect(updated.process).toBe("hierarchical");
  });

  it("should delete a crew", async () => {
    // エージェントとタスクを作成
    const agent = await caller.agent.create({
      name: "テストエージェント",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    const task = await caller.task.create({
      name: "テストタスク",
      description: "テストを実行する",
      expectedOutput: "テスト結果",
      agentId: agent.id,
    });

    // クルーを作成
    const created = await caller.crew.create({
      name: "削除テスト",
      description: "テスト用クルー",
      process: "sequential",
      agentIds: [agent.id],
      taskIds: [task.id],
    });

    // クルーを削除
    const result = await caller.crew.delete({ id: created.id });

    expect(result.success).toBe(true);

    // 削除されたことを確認
    const deleted = await caller.crew.get({ id: created.id });
    expect(deleted).toBeUndefined();
  });

  it("should validate required fields", async () => {
    await expect(
      caller.crew.create({
        name: "",
        description: "テスト用クルー",
        process: "sequential",
        agentIds: [],
        taskIds: [],
      })
    ).rejects.toThrow();
  });

  // Note: Empty agentIds and taskIds are allowed in the schema
  // The validation is done at the business logic level
});
