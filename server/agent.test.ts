import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

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

describe("agent API", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create an agent", async () => {
    const agentData = {
      name: "テストエージェント",
      role: "リサーチャー",
      goal: "市場調査を行う",
      backstory: "経験豊富なマーケットリサーチャー",
      tools: ["web_search", "data_analysis"],
      allowDelegation: true,
      verbose: false,
    };

    const result = await caller.agent.create(agentData);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe(agentData.name);
    expect(result.role).toBe(agentData.role);
    expect(result.goal).toBe(agentData.goal);
  });

  it("should list agents", async () => {
    const result = await caller.agent.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get agent by id", async () => {
    // まずエージェントを作成
    const created = await caller.agent.create({
      name: "取得テスト",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    // 作成したエージェントを取得
    const result = await caller.agent.get({ id: created.id });

    expect(result).toBeDefined();
    expect(result?.id).toBe(created.id);
    expect(result?.name).toBe("取得テスト");
  });

  it("should update an agent", async () => {
    // まずエージェントを作成
    const created = await caller.agent.create({
      name: "更新前",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    // エージェントを更新
    const updated = await caller.agent.update({
      id: created.id,
      name: "更新後",
      role: "上級テスター",
    });

    expect(updated.name).toBe("更新後");
    expect(updated.role).toBe("上級テスター");
  });

  it("should delete an agent", async () => {
    // まずエージェントを作成
    const created = await caller.agent.create({
      name: "削除テスト",
      role: "テスター",
      goal: "テストを実行する",
      backstory: "テスト専門家",
      tools: [],
      allowDelegation: false,
      verbose: false,
    });

    // エージェントを削除
    const result = await caller.agent.delete({ id: created.id });

    expect(result.success).toBe(true);

    // 削除されたことを確認
    const deleted = await caller.agent.get({ id: created.id });
    expect(deleted).toBeUndefined();
  });

  it("should validate required fields", async () => {
    await expect(
      caller.agent.create({
        name: "",
        role: "テスター",
        goal: "テストを実行する",
        backstory: "テスト専門家",
        tools: [],
        allowDelegation: false,
        verbose: false,
      })
    ).rejects.toThrow();
  });
});
