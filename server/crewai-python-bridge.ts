/**
 * CrewAI Python Bridge
 * Node.jsからPython CrewAIエンジンを呼び出すブリッジ
 */

import { spawn } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import * as db from "./db";
import { Agent, Task, Crew } from "../drizzle/schema";
import { emitCrewStart, emitCrewComplete, emitCrewError, emitLog } from "./_core/websocket";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Python実行パスを解決（環境変数 → venv → システムPython）
 */
function resolvePythonPath(): string {
  const candidates = [
    process.env.PYTHON_PATH,
    path.join(__dirname, "../venv/bin/python"),
    "/app/venv/bin/python",
    "/usr/bin/python3",
    "python3",
  ].filter(Boolean) as string[];

  console.log("[CrewAI Bridge] Resolving Python path, candidates:", candidates);

  for (const candidate of candidates) {
    if (candidate.startsWith("/") && existsSync(candidate)) {
      console.log("[CrewAI Bridge] Found Python at:", candidate);
      return candidate;
    }
  }

  // フォールバック: システムPython
  console.log("[CrewAI Bridge] Using fallback: python3");
  return "python3";
}

export interface PythonCrewAIResult {
  success: boolean;
  result?: string;
  error?: string;
  timestamp?: string;
  agents_count?: number;
  tasks_count?: number;
  token_usage?: number;
  cost?: number;
}

/**
 * モック実装（開発環境用）
 */
async function executePythonCrewAIMock(crewData: {
  name: string;
  process: string;
  verbose: boolean;
  agents: Agent[];
  tasks: Task[];
}): Promise<PythonCrewAIResult> {
  console.log("[CrewAI Bridge] Using MOCK implementation");
  console.log("[CrewAI Bridge] Crew:", crewData.name);
  console.log("[CrewAI Bridge] Agents:", crewData.agents.length);
  console.log("[CrewAI Bridge] Tasks:", crewData.tasks.length);

  // モック結果を返す
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機

  return {
    success: true,
    result: `クルー「${crewData.name}」の実行が完了しました。\n\n**実行結果:**\n${crewData.tasks.map((t, i) => `${i + 1}. ${t.description}: 完了`).join('\n')}\n\n**最終出力:**\nこれはモック実装によるテスト結果です。本番環境では、実際のCrewAIエンジンが実行されます。`,
    timestamp: new Date().toISOString(),
    agents_count: crewData.agents.length,
    tasks_count: crewData.tasks.length,
    token_usage: 1500,
    cost: 0.05,
  };
}

/**
 * Python CrewAIエンジンを実行
 */
export async function executePythonCrewAI(crewData: {
  name: string;
  process: string;
  verbose: boolean;
  agents: Agent[];
  tasks: Task[];
}): Promise<PythonCrewAIResult> {
  // 環境変数でモックモードを切り替え
  const mockEnvSetting = process.env.CREWAI_MOCK_MODE !== "false";

  // Python パスを解決
  const pythonPath = resolvePythonPath();
  const pythonAvailable = pythonPath !== "python3" || existsSync("/usr/bin/python3");

  // モックモードの判定: 環境変数がtrue、またはPythonが見つからない場合
  const useMock = mockEnvSetting || !pythonAvailable;

  console.log("[CrewAI Bridge] Environment check:");
  console.log("  - CREWAI_MOCK_MODE:", process.env.CREWAI_MOCK_MODE);
  console.log("  - NODE_ENV:", process.env.NODE_ENV);
  console.log("  - pythonPath:", pythonPath);
  console.log("  - pythonAvailable:", pythonAvailable);
  console.log("  - useMock:", useMock);

  if (useMock) {
    console.log("[CrewAI Bridge] Using MOCK mode");
    if (!mockEnvSetting && !pythonAvailable) {
      console.log("[CrewAI Bridge] Reason: Python not available, falling back to mock");
    }
    return executePythonCrewAIMock(crewData);
  }

  console.log("[CrewAI Bridge] Using REAL Python execution");
  // 本番実装（Python実行）
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, "../python/crewai_engine.py");
    const venvPython = resolvePythonPath();
    console.log("[CrewAI Bridge] Starting Python process:", pythonScript);
    console.log("[CrewAI Bridge] __dirname:", __dirname);
    console.log("[CrewAI Bridge] Python command:", venvPython);

    // 環境変数を設定（venvが存在する場合のみVIRTUAL_ENVを設定）
    const venvPath = path.join(__dirname, "../venv");
    const venvExists = existsSync(venvPath);
    const cleanEnv: NodeJS.ProcessEnv = {
      PYTHONUNBUFFERED: "1",
      ...(venvExists ? { VIRTUAL_ENV: venvPath } : {}),
      PATH: venvExists
        ? `${path.join(venvPath, "bin")}:/usr/local/bin:/usr/bin:/bin`
        : "/usr/local/bin:/usr/bin:/bin",
      PYTHONPATH: "",
      HOME: process.env.HOME,
      USER: process.env.USER,
      LANG: process.env.LANG || "en_US.UTF-8",
      // OpenAI API keyを引き継ぐ
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    };

    console.log("[CrewAI Bridge] Clean environment:", cleanEnv);

    const pythonProcess = spawn(venvPython, [pythonScript], {
      env: cleanEnv,
      cwd: path.join(__dirname, ".."),
    });

    let stdout = "";
    let stderr = "";

    // 入力データをJSON形式で送信
    pythonProcess.stdin.write(JSON.stringify(crewData));
    pythonProcess.stdin.end();

    // 標準出力を受け取る
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // 標準エラー出力を受け取る（ログ用）
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
      const logMessage = data.toString();
      console.log("[Python CrewAI]", logMessage);

      // WebSocketでリアルタイムログを送信
      // executionIdは外部スコープから取得する必要があるため、
      // ここではログ出力のみを行う
    });

    // プロセス終了
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Python process exited with code ${code}: ${stderr}`,
        });
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Python output: ${stdout}`,
        });
      }
    });

    // エラーハンドリング
    pythonProcess.on("error", (error) => {
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`,
      });
    });
  });
}

/**
 * クルーを実行（統合版）
 */
export async function executeCrewAI(crewId: number): Promise<{
  success: boolean;
  result?: string;
  error?: string;
  executionId?: number;
}> {
  try {
    // クルー情報を取得
    const crew = await db.getCrewById(crewId);
    if (!crew) {
      return { success: false, error: "Crew not found" };
    }

    // エージェントとタスクを取得
    const agentIds = crew.agentIds || [];
    const taskIds = crew.taskIds || [];

    const agents = await Promise.all(
      agentIds.map((id) => db.getAgentById(id))
    );
    const tasks = await Promise.all(taskIds.map((id) => db.getTaskById(id)));

    // nullをフィルタリング
    const validAgents = agents.filter((a) => a !== undefined);
    const validTasks = tasks.filter((t) => t !== undefined);

    if (validAgents.length === 0 || validTasks.length === 0) {
      return {
        success: false,
        error: "No valid agents or tasks found for this crew",
      };
    }

    // 実行履歴を作成
    const execution = await db.createExecution({
      userId: crew.userId,
      crewId,
      status: "running",
      output: null,
      error: null,
      startedAt: new Date(),
      completedAt: null,
    });

    // トレースログを記録
    await db.createTraceLog({
      executionId: execution.id,
      eventType: "crew_start",
      message: `クルー「${crew.name}」の実行を開始しました`,
      metadata: {
        crewId: crew.id,
        process: crew.process,
        agentCount: validAgents.length,
        taskCount: validTasks.length,
      },
    });

    // WebSocketイベントを送信
    emitCrewStart(execution.id, {
      crewName: crew.name,
      message: `クルー「${crew.name}」の実行を開始しました`,
      timestamp: new Date().toISOString(),
    });

    // Python CrewAIエンジンを実行
    const startTime = Date.now();
    const pythonResult = await executePythonCrewAI({
      name: crew.name,
      process: crew.process,
      verbose: crew.verbose,
      agents: validAgents,
      tasks: validTasks,
    });
    const executionTime = Date.now() - startTime;

    if (!pythonResult.success) {
      // 実行失敗
      await db.updateExecution(execution.id, {
        status: "failed",
        output: null,
        error: pythonResult.error,
        completedAt: new Date(),
      });

      await db.createTraceLog({
        executionId: execution.id,
        eventType: "crew_error",
        message: `クルー実行中にエラーが発生しました: ${pythonResult.error}`,
        metadata: {
          executionTime,
          error: pythonResult.error,
        },
      });

      // WebSocketイベントを送信
      emitCrewError(execution.id, {
        error: pythonResult.error,
        message: `エラー: ${pythonResult.error}`,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: pythonResult.error,
        executionId: execution.id,
      };
    }

    // 実行成功
    await db.updateExecution(execution.id, {
      status: "completed",
      output: pythonResult.result,
      error: null,
      completedAt: new Date(),
    });

    await db.createTraceLog({
      executionId: execution.id,
      eventType: "crew_complete",
      message: `クルー「${crew.name}」の実行が完了しました`,
      metadata: {
        executionTime,
        result: pythonResult.result?.substring(0, 200),
      },
    });

    // WebSocketイベントを送信
    emitCrewComplete(execution.id, {
      crewName: crew.name,
      message: `クルー「${crew.name}」の実行が完了しました`,
      result: pythonResult.result,
      timestamp: new Date().toISOString(),
    });

    // メトリクスを保存
    await db.createMetric({
      executionId: execution.id,
      tokenUsage: pythonResult.token_usage || 0,
      executionTime,
      cost: pythonResult.cost || 0,
      successRate: 100,
    });

    return {
      success: true,
      result: pythonResult.result,
      executionId: execution.id,
    };
  } catch (error) {
    console.error("[CrewAI Bridge] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
