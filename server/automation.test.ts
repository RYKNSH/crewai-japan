import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("automation.generate", () => {
  it("自然言語入力からエージェント・タスク・クルーを生成する", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.automation.generate({
      description: "毎日のニュースを収集して要約し、Notionに保存したい",
      language: "ja",
    });

    expect(result).toHaveProperty("configuration");
    expect(result.configuration).toHaveProperty("agents");
    expect(result.configuration).toHaveProperty("tasks");
    expect(result.configuration).toHaveProperty("crew");
    expect(Array.isArray(result.configuration.agents)).toBe(true);
    expect(Array.isArray(result.configuration.tasks)).toBe(true);
    expect(result.configuration.agents.length).toBeGreaterThan(0);
    expect(result.configuration.tasks.length).toBeGreaterThan(0);
  }, 60000); // 60秒のタイムアウト（LLM呼び出しに時間がかかるため）

  it("短すぎる説明でエラーを返す", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.automation.generate({
        description: "短い",
        language: "ja",
      })
    ).rejects.toThrow();
  });
});

describe("automation.createFromGenerated", () => {
  it("生成された構成からエージェント・タスク・クルーを作成する", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const generatedConfig = {
      agents: [
        {
          name: "テストエージェント",
          role: "テスター",
          goal: "テストを実行する",
          backstory: "テスト専門のエージェント",
          tools: [],
          allowDelegation: false,
          verbose: true,
        },
      ],
      tasks: [
        {
          name: "テストタスク",
          description: "テストを実行する",
          expectedOutput: "テスト結果",
          agentIndex: 0,
        },
      ],
      crew: {
        name: "テストクルー",
        description: "テスト用のクルー",
        process: "sequential" as const,
        verbose: true,
      },
    };

    const result = await caller.automation.createFromGenerated(generatedConfig);

    expect(result).toHaveProperty("crew");
    expect(result).toHaveProperty("agents");
    expect(result).toHaveProperty("tasks");
    expect(result.crew.name).toBe("テストクルー");
    expect(result.agents.length).toBe(1);
    expect(result.tasks.length).toBe(1);
  });

  it("エージェントが0個の場合エラーを返す", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const invalidConfig = {
      agents: [],
      tasks: [],
      crew: {
        name: "無効なクルー",
        description: "エージェントがいない",
        process: "sequential" as const,
        verbose: true,
      },
    };

    await expect(
      caller.automation.createFromGenerated(invalidConfig)
    ).rejects.toThrow();
  });
});
