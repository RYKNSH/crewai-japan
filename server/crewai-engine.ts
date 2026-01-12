import * as db from "./db";

/**
 * CrewAI統合エンジン
 * 動的クルー編成機能のみを提供
 */

/**
 * 動的クルー編成: タスクに応じて最適なエージェントを選択
 */
export async function autoAssignAgents(
  userId: number,
  taskDescriptions: string[]
): Promise<{ agentId: number; taskIndex: number }[]> {
  const agents = await db.getAgentsByUserId(userId);
  
  if (agents.length === 0) {
    throw new Error("利用可能なエージェントがありません");
  }

  // 簡易的なマッチングロジック（実際はLLMを使った高度なマッチングが必要）
  const assignments: { agentId: number; taskIndex: number }[] = [];
  
  taskDescriptions.forEach((description, index) => {
    // 各タスクに最も適したエージェントを選択
    // ここでは単純にラウンドロビンで割り当て
    const agent = agents[index % agents.length];
    if (agent) {
      assignments.push({
        agentId: agent.id,
        taskIndex: index,
      });
    }
  });

  return assignments;
}
