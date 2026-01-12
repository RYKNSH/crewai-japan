import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Integration Tests", () => {
  describe("Agent, Task, Crew Workflow", () => {
    it("should create agent, task, crew and list them", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // エージェントを作成
      const agent = await caller.agent.create({
        name: "統合テストエージェント",
        role: "リサーチャー",
        goal: "情報を収集する",
        backstory: "経験豊富なリサーチャー",
        tools: [],
        allowDelegation: false,
        verbose: true,
      });

      expect(agent.id).toBeDefined();
      expect(agent.name).toBe("統合テストエージェント");

      // タスクを作成
      const task = await caller.task.create({
        name: "統合テストタスク",
        description: "AIトレンドを調査する",
        expectedOutput: "AIトレンドのサマリー",
        agentId: agent.id,
      });

      expect(task.id).toBeDefined();
      expect(task.name).toBe("統合テストタスク");
      expect(task.agentId).toBe(agent.id);

      // クルーを作成
      const crew = await caller.crew.create({
        name: "統合テストクルー",
        process: "sequential",
        verbose: true,
        agentIds: [agent.id],
        taskIds: [task.id],
      });

      expect(crew.id).toBeDefined();
      expect(crew.name).toBe("統合テストクルー");

      // 一覧を取得
      const agents = await caller.agent.list();
      const tasks = await caller.task.list();
      const crews = await caller.crew.list();

      expect(agents.some((a) => a.id === agent.id)).toBe(true);
      expect(tasks.some((t) => t.id === task.id)).toBe(true);
      expect(crews.some((c) => c.id === crew.id)).toBe(true);

      // クリーンアップ
      await caller.crew.delete({ id: crew.id });
      await caller.task.delete({ id: task.id });
      await caller.agent.delete({ id: agent.id });
    });
  });

  describe("MCP Integration", () => {
    it("should list available MCP servers", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const servers = await caller.mcp.listServers();

      expect(servers).toBeDefined();
      expect(Array.isArray(servers)).toBe(true);
      expect(servers.length).toBeGreaterThan(0);

      // Notion、Gmail、Google Calendarが含まれているか確認
      const serverNames = servers.map((s) => s.name);
      expect(serverNames).toContain("notion");
      expect(serverNames).toContain("gmail");
      expect(serverNames).toContain("google-calendar");
    });
  });

  describe("Tool Management", () => {
    it("should create and list tools", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // ツールを作成
      const tool = await caller.tool.create({
        name: "統合テストツール",
        type: "custom",
        description: "テスト用のカスタムツール",
        config: {
          endpoint: "https://example.com/api",
        },
      });

      expect(tool.id).toBeDefined();
      expect(tool.name).toBe("統合テストツール");

      // 一覧を取得
      const tools = await caller.tool.list();
      expect(tools.some((t) => t.id === tool.id)).toBe(true);

      // クリーンアップ
      await caller.tool.delete({ id: tool.id });
    });
  });
});
