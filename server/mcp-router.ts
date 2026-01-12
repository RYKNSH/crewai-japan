import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { listMCPTools, callMCPTool, AVAILABLE_MCP_SERVERS } from "./mcp-integration";

export const mcpRouter = router({
  /**
   * 利用可能なMCPサーバー一覧を取得
   */
  listServers: protectedProcedure.query(async () => {
    return AVAILABLE_MCP_SERVERS;
  }),

  /**
   * 特定のMCPサーバーの利用可能なツール一覧を取得
   */
  listTools: protectedProcedure
    .input(
      z.object({
        server: z.string(),
      })
    )
    .query(async ({ input }) => {
      return listMCPTools(input.server);
    }),

  /**
   * MCPツールを呼び出す
   */
  callTool: protectedProcedure
    .input(
      z.object({
        server: z.string(),
        tool: z.string(),
        arguments: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return callMCPTool({
        server: input.server,
        tool: input.tool,
        arguments: input.arguments,
      });
    }),
});
