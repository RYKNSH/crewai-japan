/**
 * MCP統合ヘルパー
 * ユーザーのMCPサーバー（Notion、Gmail、Google Calendar）と連携
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface MCPToolCall {
  server: string;
  tool: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * MCPツールを呼び出す
 */
export async function callMCPTool(
  toolCall: MCPToolCall
): Promise<MCPToolResult> {
  try {
    const { server, tool, arguments: args } = toolCall;

    // manus-mcp-cliを使用してツールを呼び出す
    const argsJson = JSON.stringify(args);
    const command = `manus-mcp-cli tool call ${tool} --server ${server} --input '${argsJson}'`;

    console.log(`[MCP] Calling tool: ${server}.${tool}`);
    console.log(`[MCP] Arguments: ${argsJson}`);

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 60000, // 60秒
    });

    if (stderr) {
      console.warn(`[MCP] Warning: ${stderr}`);
    }

    // 出力をパース
    const result = JSON.parse(stdout.trim());

    console.log(`[MCP] Tool call successful`);
    return {
      success: true,
      result,
    };
  } catch (error: any) {
    console.error(`[MCP] Tool call failed:`, error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * MCPサーバーの利用可能なツール一覧を取得
 */
export async function listMCPTools(
  server: string
): Promise<{ success: boolean; tools?: any[]; error?: string }> {
  try {
    const command = `manus-mcp-cli tool list --server ${server}`;

    console.log(`[MCP] Listing tools for server: ${server}`);

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
    });

    if (stderr) {
      console.warn(`[MCP] Warning: ${stderr}`);
    }

    const tools = JSON.parse(stdout.trim());

    console.log(`[MCP] Found ${tools.length} tools`);
    return {
      success: true,
      tools,
    };
  } catch (error: any) {
    console.error(`[MCP] Failed to list tools:`, error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * 利用可能なMCPサーバー一覧
 */
export const AVAILABLE_MCP_SERVERS = [
  {
    name: "notion",
    displayName: "Notion",
    description: "ドキュメント管理、データベース操作、ページ作成",
  },
  {
    name: "gmail",
    displayName: "Gmail",
    description: "メール送信、受信、検索",
  },
  {
    name: "google-calendar",
    displayName: "Google Calendar",
    description: "カレンダーイベントの作成、取得、更新",
  },
];

/**
 * CrewAI用のMCPツール定義を生成
 */
export function generateCrewAIToolDefinition(
  server: string,
  toolName: string,
  toolDescription: string,
  parameters: Record<string, any>
): string {
  return `
from crewai_tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import json
import subprocess

class ${toolName}Input(BaseModel):
    """Input schema for ${toolName}."""
    ${Object.entries(parameters)
      .map(
        ([key, value]) =>
          `${key}: str = Field(..., description="${value.description || key}")`
      )
      .join("\n    ")}

class ${toolName}(BaseTool):
    name: str = "${toolName}"
    description: str = "${toolDescription}"
    args_schema: Type[BaseModel] = ${toolName}Input

    def _run(self, **kwargs) -> str:
        """Execute the tool."""
        try:
            args_json = json.dumps(kwargs)
            result = subprocess.run(
                ["manus-mcp-cli", "tool", "call", "${toolName}", "--server", "${server}", "--input", args_json],
                capture_output=True,
                text=True,
                timeout=60
            )
            if result.returncode != 0:
                return f"Error: {result.stderr}"
            return result.stdout
        except Exception as e:
            return f"Error: {str(e)}"
`;
}
