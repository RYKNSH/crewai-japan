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

describe("task API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a task", async () => {
    const taskData = {
      name: "市場調査タスク",
      description: "最新の市場トレンドを調査する",
      expectedOutput: "市場分析レポート",
      agentId: undefined,
    };

    const result = await caller.task.create(taskData);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe(taskData.name);
    expect(result.description).toBe(taskData.description);
    expect(result.expectedOutput).toBe(taskData.expectedOutput);
  });

  it("should list tasks", async () => {
    const result = await caller.task.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get task by id", async () => {
    // まずタスクを作成
    const created = await caller.task.create({
      name: "取得テスト",
      description: "テスト用タスク",
      expectedOutput: "テスト結果",
      agentId: undefined,
    });

    // 作成したタスクを取得
    const result = await caller.task.get({ id: created.id });

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe("取得テスト");
  });

  it("should update a task", async () => {
    // まずタスクを作成
    const created = await caller.task.create({
      name: "更新前",
      description: "テスト用タスク",
      expectedOutput: "テスト結果",
      agentId: undefined,
    });

    // タスクを更新
    const updated = await caller.task.update({
      id: created.id,
      name: "更新後",
      description: "更新されたタスク",
    });

    expect(updated.name).toBe("更新後");
    expect(updated.description).toBe("更新されたタスク");
  });

  it("should delete a task", async () => {
    // まずタスクを作成
    const created = await caller.task.create({
      name: "削除テスト",
      description: "テスト用タスク",
      expectedOutput: "テスト結果",
      agentId: undefined,
    });

    // タスクを削除
    const result = await caller.task.delete({ id: created.id });

    expect(result.success).toBe(true);

    // 削除されたことを確認
    const deleted = await caller.task.get({ id: created.id });
    expect(deleted).toBeUndefined();
  });

  it("should validate required fields", async () => {
    await expect(
      caller.task.create({
        name: "",
        description: "テスト用タスク",
        expectedOutput: "テスト結果",
        agentId: undefined,
      })
    ).rejects.toThrow();
  });

  it("should create task with agent assignment", async () => {
    // まずエージェントを作成
    const agent = await caller.agent.create({
      name: "テストエージェント",
      role: "リサーチャー",
      goal: "調査を行う",
      backstory: "経験豊富なリサーチャー",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    // エージェントを割り当ててタスクを作成
    const task = await caller.task.create({
      name: "割り当てテスト",
      description: "エージェント割り当てテスト",
      expectedOutput: "テスト結果",
      agentId: agent.id,
    });

    expect(task.agentId).toBe(agent.id);
  });
});
