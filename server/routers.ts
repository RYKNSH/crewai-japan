import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { executionRouter } from "./execution-router";
import { mcpRouter } from "./mcp-router";
import { automationRouter } from "./automation-router";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== Agent Router ==========
  agent: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getAgentsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getAgentById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        goal: z.string().min(1),
        backstory: z.string().min(1),
        tools: z.array(z.string()).optional(),
        allowDelegation: z.boolean().default(true),
        verbose: z.boolean().default(false),
        llmConfig: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createAgent({
          userId: ctx.user.id,
          name: input.name,
          role: input.role,
          goal: input.goal,
          backstory: input.backstory,
          tools: input.tools,
          allowDelegation: input.allowDelegation,
          verbose: input.verbose,
          llmConfig: input.llmConfig,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        role: z.string().min(1).optional(),
        goal: z.string().min(1).optional(),
        backstory: z.string().min(1).optional(),
        tools: z.array(z.string()).optional(),
        allowDelegation: z.boolean().optional(),
        verbose: z.boolean().optional(),
        llmConfig: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateAgent(id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAgent(input.id);
        return { success: true };
      }),
  }),

  // ========== Task Router ==========
  task: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTasksByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTaskById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        expectedOutput: z.string().optional(),
        agentId: z.number().optional(),
        context: z.array(z.number()).optional(),
        asyncExecution: z.boolean().default(false),
        humanInput: z.boolean().optional(),
        outputFile: z.string().optional(),
        outputPydantic: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTask({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          expectedOutput: input.expectedOutput,
          agentId: input.agentId,
          context: input.context,
          asyncExecution: input.asyncExecution,
          humanInput: input.humanInput,
          outputFile: input.outputFile,
          outputPydantic: input.outputPydantic,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        expectedOutput: z.string().optional(),
        agentId: z.number().optional(),
        context: z.array(z.number()).optional(),
        asyncExecution: z.boolean().optional(),
        humanInput: z.boolean().optional(),
        outputFile: z.string().optional(),
        outputPydantic: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTask(id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTask(input.id);
        return { success: true };
      }),
  }),

  // ========== Crew Router ==========
  crew: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCrewsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCrewById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        process: z.enum(["sequential", "hierarchical", "consensual"]).default("sequential"),
        verbose: z.boolean().default(false),
        agentIds: z.array(z.number()).optional(),
        taskIds: z.array(z.number()).optional(),
        managerLlmConfig: z.record(z.string(), z.unknown()).optional(),
        // CrewAI完全機能
        memory: z.boolean().optional(),
        planning: z.boolean().optional(),
        planningLlmConfig: z.record(z.string(), z.unknown()).optional(),
        maxRpm: z.number().optional(),
        maxExecutionTime: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createCrew({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          process: input.process,
          verbose: input.verbose,
          agentIds: input.agentIds,
          taskIds: input.taskIds,
          managerLlmConfig: input.managerLlmConfig,
          memory: input.memory,
          planning: input.planning,
          planningLlmConfig: input.planningLlmConfig,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        process: z.enum(["sequential", "hierarchical", "consensual"]).optional(),
        verbose: z.boolean().optional(),
        agentIds: z.array(z.number()).optional(),
        taskIds: z.array(z.number()).optional(),
        managerLlmConfig: z.record(z.string(), z.unknown()).optional(),
        // CrewAI完全機能
        memory: z.boolean().optional(),
        planning: z.boolean().optional(),
        planningLlmConfig: z.record(z.string(), z.unknown()).optional(),
        maxRpm: z.number().optional(),
        maxExecutionTime: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCrew(id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCrew(input.id);
        return { success: true };
      }),
  }),

  // ========== Execution Router ==========
  execution: executionRouter,
  mcp: mcpRouter,
  automation: automationRouter,

  // ========== Tool Router ==========
  // ========== Memory Store Router ==========
  memory: router({  
    list: protectedProcedure
      .input(z.object({
        crewId: z.number().optional(),
        agentId: z.number().optional(),
        executionId: z.number().optional(),
        memoryType: z.enum(["short_term", "long_term", "entity"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getMemoriesByUserId(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        crewId: z.number().optional(),
        agentId: z.number().optional(),
        executionId: z.number().optional(),
        memoryType: z.enum(["short_term", "long_term", "entity"]),
        content: z.string().min(1),
        embedding: z.array(z.number()).optional(),
        entityType: z.string().optional(),
        entityName: z.string().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createMemory({
          userId: ctx.user.id,
          crewId: input.crewId,
          agentId: input.agentId,
          executionId: input.executionId,
          memoryType: input.memoryType,
          content: input.content,
          embedding: input.embedding,
          entityType: input.entityType,
          entityName: input.entityName,
          expiresAt: input.expiresAt,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMemory(input.id);
        return { success: true };
      }),
  }),

  // ========== Training Data Router ==========
  training: router({
    listByCrewId: protectedProcedure
      .input(z.object({ crewId: z.number() }))
      .query(async ({ input }) => {
        return db.getTrainingDataByCrewId(input.crewId);
      }),

    create: protectedProcedure
      .input(z.object({
        crewId: z.number(),
        executionId: z.number(),
        input: z.string().min(1),
        output: z.string().min(1),
        feedback: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        taskResults: z.array(z.object({
          taskId: z.number(),
          output: z.string(),
          success: z.boolean(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTrainingData({
          userId: ctx.user.id,
          crewId: input.crewId,
          executionId: input.executionId,
          input: input.input,
          output: input.output,
          feedback: input.feedback,
          rating: input.rating,
          taskResults: input.taskResults,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        feedback: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTrainingData(id, data);
      }),
  }),

  // ========== Knowledge Base Router ==========
  knowledge: router({
    list: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        crewId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getKnowledgeByUserId(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        crewId: z.number().optional(),
        sourceType: z.enum(["file", "url", "text"]),
        sourcePath: z.string().optional(),
        content: z.string().optional(),
        embedding: z.array(z.number()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createKnowledge({
          userId: ctx.user.id,
          agentId: input.agentId,
          crewId: input.crewId,
          sourceType: input.sourceType,
          sourcePath: input.sourcePath,
          content: input.content,
          embedding: input.embedding,
          metadata: input.metadata,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        embedding: z.array(z.number()).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateKnowledge(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteKnowledge(input.id);
        return { success: true };
      }),
  }),

  // ========== Event Listener Router ==========
  eventListener: router({
    listByCrewId: protectedProcedure
      .input(z.object({ crewId: z.number() }))
      .query(async ({ input }) => {
        return db.getEventListenersByCrewId(input.crewId);
      }),

    create: protectedProcedure
      .input(z.object({
        crewId: z.number(),
        eventType: z.string().min(1),
        callbackFunction: z.string().min(1),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createEventListener({
          userId: ctx.user.id,
          crewId: input.crewId,
          eventType: input.eventType,
          callbackFunction: input.callbackFunction,
          isActive: input.isActive,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        eventType: z.string().optional(),
        callbackFunction: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateEventListener(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEventListener(input.id);
        return { success: true };
      }),
  }),

  tool: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getToolsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getToolById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["builtin", "custom", "mcp"]).default("custom"),
        description: z.string().optional(),
        config: z.record(z.string(), z.unknown()).optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTool({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          description: input.description,
          config: input.config,
          isActive: input.isActive,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        type: z.enum(["builtin", "custom", "mcp"]).optional(),
        description: z.string().optional(),
        config: z.record(z.string(), z.unknown()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTool(id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTool(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
