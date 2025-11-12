import { useEffect } from "react";
import { webSocketService } from "@/services/websocket/websocket.service";
import logger from "@/common/utils/logger";

export const useWebSocket = () => {
  useEffect(() => {
    // Connect to the server
    webSocketService.connect().then((socket) => {
      logger.log(
        { prefix: "WS" },
        "Connected to WebSocket server",
        socket.connected
      );

      socket.on("error", (error) => {
        logger.error({ prefix: "WS" }, error);
      });
    });

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, []);
};
