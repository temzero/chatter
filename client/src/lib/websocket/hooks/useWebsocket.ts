import { useEffect } from "react";
import { webSocketService } from "@/lib/websocket/services/websocket.service";
import { toast } from "react-toastify";

export const useWebSocket = () => {
  useEffect(() => {
    // Connect to the server
    webSocketService.connect().then((socket) => {
      // console.log("[WS] 🔌 Connected? ", socket.connected);

      // Listen to server-emitted errors
      // socket.on("error", (error) => {
      //   console.error("[WS] ❌ Error received:", error);
      //   toast.error(error.message || "WebSocket error occurred");
      // });

      socket.on("error", (error) => {
        console.error("[WS] ❌ Error received:", error);

        // Safe error message extraction
        const errorMessage =
          (error && error.message) || // Check for error.message
          (typeof error === "string" && error) || // Check if error is a string
          "WebSocket error occurred"; // Fallback message

        toast.error(errorMessage);
      });
    });

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, []);
};
