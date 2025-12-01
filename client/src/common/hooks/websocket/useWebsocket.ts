import { useEffect } from "react";
import { webSocketService } from "@/services/websocket/websocketService";

export const useWebSocket = () => {
  useEffect(() => {
    // Connect to the server
    webSocketService.connect().then((socket) => {
      console.log("[WS]", "Connected to WebSocket server", socket.connected);

      socket.on("error", (error) => {
        console.error("[WS]", error);
      });
    });

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, []);
};
