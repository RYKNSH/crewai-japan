import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { executeCrewAI } from "./crewai-python-bridge";
import { autoAssignAgents } from "./crewai-engine";

export const executionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getExecutionsByUserId(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getExecutionById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      crewId: z.number(),
      input: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return db.createExecution({
        userId: ctx.user.id,
        crewId: input.crewId,
        input: input.input,
        status: "pending",
      });
    }),

  /**
   * クルーを実行する
   */
  execute: protectedProcedure
    .input(z.object({
      crewId: z.number(),
      input: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // クルーを取得
      const crew = await db.getCrewById(input.crewId);
      if (!crew) {
        throw new Error("クルーが見つかりません");
      }
      if (crew.userId !== ctx.user.id) {
        throw new Error("このクルーにアクセスする権限がありません");
      }

      // エージェントとタスクを取得
      const agentIds = crew.agentIds || [];
      const taskIds = crew.taskIds || [];

      const agents = await Promise.all(
        agentIds.map(id => db.getAgentById(id))
      );
      const tasks = await Promise.all(
        taskIds.map(id => db.getTaskById(id))
      );

      const validAgents = agents.filter(a => a !== undefined);
      const validTasks = tasks.filter(t => t !== undefined);

      // CrewAIを実行（Pythonブリッジ経由）
      // executeCrewAI関数内部で実行レコードが作成されます
      const result = await executeCrewAI(input.crewId);

      if (!result.success || !result.executionId) {
        throw new Error(result.error || "実行に失敗しました");
      }

      // 実行履歴を取得
      const updatedExecution = await db.getExecutionById(result.executionId);
      if (!updatedExecution) {
        throw new Error("実行履歴が見つかりません");
      }

      return updatedExecution;
    }),

  /**
   * 動的クルー編成: タスクに応じて最適なエージェントを自動選択
   */
  autoAssign: protectedProcedure
    .input(z.object({
      taskDescriptions: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      return autoAssignAgents(ctx.user.id, input.taskDescriptions);
    }),

  traceLogs: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      return db.getTraceLogsByExecutionId(input.executionId);
    }),

  metrics: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      return db.getMetricsByExecutionId(input.executionId);
    }),
});
