// src/hooks/useWebSocket.ts
import { useEffect } from "react";
import { webSocketService } from "@/lib/websocket/services/websocket.service";

export const useWebSocket = () => {
  useEffect(() => {
    // Connect on mount
    webSocketService.connect().then((socket) => {
      console.log("[WS] 🔌 Connected? ", socket.connected);
    });

    // Disconnect on unmount
    return () => {
      webSocketService.disconnect();
      console.log("[WS] 🔌 Disconnected");
    };
  }, []);
};
