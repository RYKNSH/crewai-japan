import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * オートメーション自動生成ルーター
 * 自然言語入力からエージェント・タスク・クルーを自動生成
 */
export const automationRouter = router({
  /**
   * 自然言語からエージェント・タスク・クルーを自動生成
   */
  generate: protectedProcedure
    .input(
      z.object({
        description: z.string().min(10, "説明は10文字以上で入力してください"),
        language: z.enum(["ja", "en"]).default("ja"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { description, language } = input;

      // LLMを使用してエージェント・タスク・クルーを自動生成
      const systemPrompt = language === "ja" 
        ? `あなたはCrewAIの専門家です。ユーザーの要望を分析し、最適なエージェント・タスク・クルー構成を設計してください。

**出力形式:**
以下のJSON形式で出力してください：
{
  "agents": [
    {
      "name": "エージェント名",
      "role": "役割",
      "goal": "目標",
      "backstory": "背景ストーリー",
      "tools": ["tool1", "tool2"],
      "allowDelegation": true/false,
      "verbose": true/false,
      "memory": true/false,
      "memoryConfig": { "shortTerm": true, "longTerm": false, "entity": false },
      "maxIter": 15,
      "maxRpm": 60,
      "maxRetryLimit": 2,
      "codeExecutionMode": "safe",
      "knowledgeSources": []
    }
  ],
  "tasks": [
    {
      "name": "タスク名",
      "description": "タスクの詳細説明",
      "expectedOutput": "期待される出力",
      "agentIndex": 0,
      "context": [],
      "humanInput": false,
      "asyncExecution": false,
      "outputFile": "",
      "outputPydantic": null
    }
  ],
  "crew": {
    "name": "クルー名",
    "description": "クルーの説明",
    "process": "sequential" or "hierarchical" or "consensual",
    "verbose": true/false,
    "memory": true/false,
    "planning": true/false,
    "planningLlmConfig": null,
    "maxRpm": 60,
    "maxExecutionTime": 3600,
    "managerLlmConfig": null
  }
}

**重要な注意事項:**
1. agentIndexは、agents配列のインデックス（０から始まる）を指定してください
2. toolsは、["web_search", "file_operations", "notion", "gmail", "google_calendar"]から選択してください
3. processは"sequential"（順次実行）、"hierarchical"（階層的実行）、"consensual"（合意形成）から選択してください
4. 各エージェントは明確な役割分担を持つようにしてください
5. タスクは具体的で実行可能な内容にしてください
6. memoryを有効にすると、エージェントが過去の実行を記憶し学習します
7. planningを有効にすると、実行前にタスクの計画を立て最適化します
8. humanInputを有効にすると、タスク実行前に人間の承認が必要になります
9. asyncExecutionを有効にすると、タスクを非同期で実行し他のタスクと並行処理します
10. maxIterはエージェントがタスクを完了するまでの最大試行回数です（デフォルト: 15）`
        : `You are a CrewAI expert. Analyze the user's requirements and design an optimal agent-task-crew configuration.

**Output Format:**
Please output in the following JSON format:
{
  "agents": [
    {
      "name": "Agent Name",
      "role": "Role",
      "goal": "Goal",
      "backstory": "Backstory",
      "tools": ["tool1", "tool2"],
      "allowDelegation": true/false,
      "verbose": true/false
    }
  ],
  "tasks": [
    {
      "name": "Task Name",
      "description": "Task Description",
      "expectedOutput": "Expected Output",
      "agentIndex": 0
    }
  ],
  "crew": {
    "name": "Crew Name",
    "description": "Crew Description",
    "process": "sequential" or "hierarchical",
    "verbose": true/false
  }
}

**Important Notes:**
1. agentIndex should specify the index in the agents array (starting from 0)
2. tools should be selected from ["web_search", "file_operations", "notion", "gmail", "google_calendar"]
3. process should be either "sequential" (sequential execution) or "hierarchical" (hierarchical execution)
4. Each agent should have a clear role division
5. Tasks should be specific and executable`;

      const userPrompt = language === "ja"
        ? `以下の要望に基づいて、CrewAIのエージェント・タスク・クルー構成を設計してください：

${description}

上記の要望を実現するために、適切なエージェント（役割・目標・背景）、タスク（実行内容・期待される出力）、クルー（プロセスタイプ）を設計してください。`
        : `Design a CrewAI agent-task-crew configuration based on the following requirements:

${description}

Design appropriate agents (role, goal, backstory), tasks (execution content, expected output), and crew (process type) to achieve the above requirements.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "crewai_configuration",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  agents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        role: { type: "string" },
                        goal: { type: "string" },
                        backstory: { type: "string" },
                        tools: {
                          type: "array",
                          items: { type: "string" },
                        },
                        allowDelegation: { type: "boolean" },
                        verbose: { type: "boolean" },
                        memory: { type: "boolean" },
                        memoryConfig: {
                          type: "object",
                          properties: {
                            shortTerm: { type: "boolean" },
                            longTerm: { type: "boolean" },
                            entity: { type: "boolean" },
                          },
                        },
                        maxIter: { type: "integer" },
                        maxRpm: { type: "integer" },
                        maxRetryLimit: { type: "integer" },
                        codeExecutionMode: { type: "string", enum: ["safe", "unsafe"] },
                        knowledgeSources: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: ["name", "role", "goal", "backstory", "tools", "allowDelegation", "verbose"],
                      additionalProperties: true,
                    },
                  },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        expectedOutput: { type: "string" },
                        agentIndex: { type: "integer" },
                        context: {
                          type: "array",
                          items: { type: "integer" },
                        },
                        humanInput: { type: "boolean" },
                        asyncExecution: { type: "boolean" },
                        outputFile: { type: "string" },
                        outputPydantic: { type: "object" },
                      },
                      required: ["name", "description", "expectedOutput", "agentIndex"],
                      additionalProperties: true,
                    },
                  },
                  crew: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      process: { type: "string", enum: ["sequential", "hierarchical", "consensual"] },
                      verbose: { type: "boolean" },
                      memory: { type: "boolean" },
                      planning: { type: "boolean" },
                      planningLlmConfig: { type: "object" },
                      maxRpm: { type: "integer" },
                      maxExecutionTime: { type: "integer" },
                      managerLlmConfig: { type: "object" },
                    },
                    required: ["name", "description", "process", "verbose"],
                    additionalProperties: true,
                  },
                },
                required: ["agents", "tasks", "crew"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("LLMからのレスポンスが空です");
        }

        const configuration = JSON.parse(content);

        return {
          success: true,
          configuration,
        };
      } catch (error) {
        console.error("[Automation] Generation error:", error);
        throw new Error(`自動生成に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
      }
    }),

  /**
   * 生成された構成をDBに保存してクルーを作成
   */
  createFromGenerated: protectedProcedure
    .input(
      z.object({
        agents: z.array(
          z.object({
            name: z.string(),
            role: z.string(),
            goal: z.string(),
            backstory: z.string(),
            tools: z.array(z.string()),
            allowDelegation: z.boolean(),
            verbose: z.boolean(),
            memory: z.boolean().optional(),
            memoryConfig: z.object({
              shortTerm: z.boolean().optional(),
              longTerm: z.boolean().optional(),
              entity: z.boolean().optional(),
            }).optional(),
            maxIter: z.number().optional(),
            maxRpm: z.number().optional(),
            maxRetryLimit: z.number().optional(),
            codeExecutionMode: z.enum(["safe", "unsafe"]).optional(),
            knowledgeSources: z.array(z.string()).optional(),
          })
        ).min(1, "エージェントは1個以上必要です"),
        tasks: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            expectedOutput: z.string(),
            agentIndex: z.number(),
            context: z.array(z.number()).optional(),
            humanInput: z.boolean().optional(),
            asyncExecution: z.boolean().optional(),
            outputFile: z.string().optional(),
            outputPydantic: z.record(z.string(), z.unknown()).optional(),
          })
        ).min(1, "タスクは1個以上必要です"),
        crew: z.object({
          name: z.string(),
          description: z.string(),
          process: z.enum(["sequential", "hierarchical", "consensual"]),
          verbose: z.boolean(),
          memory: z.boolean().optional(),
          planning: z.boolean().optional(),
          planningLlmConfig: z.record(z.string(), z.unknown()).optional(),
          maxRpm: z.number().optional(),
          maxExecutionTime: z.number().optional(),
          managerLlmConfig: z.record(z.string(), z.unknown()).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { agents: agentConfigs, tasks: taskConfigs, crew: crewConfig } = input;

      try {
        // エージェントを作成
        const createdAgents = await Promise.all(
          agentConfigs.map((agent) =>
            db.createAgent({
              userId: ctx.user.id,
              name: agent.name,
              role: agent.role,
              goal: agent.goal,
              backstory: agent.backstory,
              tools: agent.tools,
              allowDelegation: agent.allowDelegation,
              verbose: agent.verbose,
              memory: agent.memory,
              memoryConfig: agent.memoryConfig,
              maxIter: agent.maxIter,
              maxRpm: agent.maxRpm,
              maxRetryLimit: agent.maxRetryLimit,
              codeExecutionMode: agent.codeExecutionMode,
              knowledgeSources: agent.knowledgeSources,
            })
          )
        );

        // タスクを作成
        const createdTasks = await Promise.all(
          taskConfigs.map((task) =>
            db.createTask({
              userId: ctx.user.id,
              name: task.name,
              description: task.description,
              expectedOutput: task.expectedOutput,
              agentId: createdAgents[task.agentIndex]?.id || null,
              context: task.context,
              humanInput: task.humanInput,
              asyncExecution: task.asyncExecution,
              outputFile: task.outputFile,
              outputPydantic: task.outputPydantic,
            })
          )
        );

        // クルーを作成
        const crew = await db.createCrew({
          userId: ctx.user.id,
          name: crewConfig.name,
          description: crewConfig.description,
          process: crewConfig.process,
          verbose: crewConfig.verbose,
          agentIds: createdAgents.map((a) => a.id),
          taskIds: createdTasks.map((t) => t.id),
          memory: crewConfig.memory,
          planning: crewConfig.planning,
          planningLlmConfig: crewConfig.planningLlmConfig,
        });

        return {
          success: true,
          crew,
          agents: createdAgents,
          tasks: createdTasks,
        };
      } catch (error) {
        console.error("[Automation] Creation error:", error);
        throw new Error(`クルーの作成に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
      }
    }),
});
