/**
 * WebSocketサーバー
 * リアルタイムでクルー実行状況をストリーミング
 */

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

/**
 * WebSocketサーバーを初期化
 */
export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // 本番環境では適切なオリジンを設定
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    // クライアントが特定の実行をサブスクライブ
    socket.on("subscribe:execution", (executionId: number) => {
      const room = `execution:${executionId}`;
      socket.join(room);
      console.log(`[WebSocket] Client ${socket.id} subscribed to ${room}`);
    });

    // クライアントが特定の実行のサブスクライブを解除
    socket.on("unsubscribe:execution", (executionId: number) => {
      const room = `execution:${executionId}`;
      socket.leave(room);
      console.log(`[WebSocket] Client ${socket.id} unsubscribed from ${room}`);
    });
  });

  console.log("[WebSocket] Server initialized");
  return io;
}

/**
 * WebSocketサーバーインスタンスを取得
 */
export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * 特定の実行に対してイベントを送信
 */
export function emitToExecution(executionId: number, event: string, data: any) {
  if (!io) {
    console.warn("[WebSocket] Server not initialized");
    return;
  }

  const room = `execution:${executionId}`;
  io.to(room).emit(event, data);
  console.log(`[WebSocket] Emitted ${event} to ${room}`);
}

/**
 * クルー実行開始イベント
 */
export function emitCrewStart(executionId: number, data: any) {
  emitToExecution(executionId, "crew:start", data);
}

/**
 * クルー実行完了イベント
 */
export function emitCrewComplete(executionId: number, data: any) {
  emitToExecution(executionId, "crew:complete", data);
}

/**
 * クルー実行エラーイベント
 */
export function emitCrewError(executionId: number, data: any) {
  emitToExecution(executionId, "crew:error", data);
}

/**
 * タスク開始イベント
 */
export function emitTaskStart(executionId: number, data: any) {
  emitToExecution(executionId, "task:start", data);
}

/**
 * タスク完了イベント
 */
export function emitTaskComplete(executionId: number, data: any) {
  emitToExecution(executionId, "task:complete", data);
}

/**
 * エージェントアクションイベント
 */
export function emitAgentAction(executionId: number, data: any) {
  emitToExecution(executionId, "agent:action", data);
}

/**
 * ログメッセージイベント
 */
export function emitLog(executionId: number, data: any) {
  emitToExecution(executionId, "log", data);
}
