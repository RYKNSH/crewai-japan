/**
 * useExecutionStream
 * WebSocketを使用してクルー実行をリアルタイムで監視
 */

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface ExecutionEvent {
  type: string;
  timestamp: string;
  data: any;
}

export function useExecutionStream(executionId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!executionId) return;

    // WebSocketサーバーに接続
    const socketInstance = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);
      
      // 実行をサブスクライブ
      socketInstance.emit("subscribe:execution", executionId);
    });

    socketInstance.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    // イベントリスナーを設定
    const eventTypes = [
      "crew:start",
      "crew:complete",
      "crew:error",
      "task:start",
      "task:complete",
      "agent:action",
      "log",
    ];

    eventTypes.forEach((eventType) => {
      socketInstance.on(eventType, (data: any) => {
        const event: ExecutionEvent = {
          type: eventType,
          timestamp: new Date().toISOString(),
          data,
        };
        setEvents((prev) => [...prev, event]);
      });
    });

    setSocket(socketInstance);

    // クリーンアップ
    return () => {
      if (socketInstance) {
        socketInstance.emit("unsubscribe:execution", executionId);
        socketInstance.disconnect();
      }
    };
  }, [executionId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    socket,
    events,
    isConnected,
    clearEvents,
  };
}
