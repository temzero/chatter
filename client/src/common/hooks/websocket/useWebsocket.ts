import { useEffect } from "react";
import { webSocketService } from "@/services/websocket/websocket.service";

export const useWebSocket = () => {
  useEffect(() => {
    // Connect to the server
    webSocketService.connect().then((socket) => {
      // console.log("[WS] 🔌 Connected? ", socket.connected);

      socket.on("error", (error) => {
        console.error("[WS] ❌ Error received:", error);
      });
    });

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, []);
};
