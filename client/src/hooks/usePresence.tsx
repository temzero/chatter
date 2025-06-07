// hooks/usePresence.ts
import { useEffect, useState } from "react";
import { webSocketService } from "@/lib/websocket/websocketService";

export const usePresence = (userId?: string) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) {
      // If no userId provided, track current user's status (original behavior)
      const handleConnect = () => setIsOnline(true);
      const handleDisconnect = () => setIsOnline(false);

      const socket = webSocketService.getSocket();
      setIsOnline(socket?.connected || false);

      socket?.on("connect", handleConnect);
      socket?.on("disconnect", handleDisconnect);

      return () => {
        socket?.off("connect", handleConnect);
        socket?.off("disconnect", handleDisconnect);
      };
    } else {
      // Track another user's status
      const socket = webSocketService.getSocket();

      // Request initial status
      socket?.emit("presence:get", userId, (status: boolean) => {
        setIsOnline(status);
      });

      // Listen for updates
      const presenceHandler = (id: string, online: boolean) => {
        if (id === userId) {
          setIsOnline(online);
        }
      };

      socket?.on("presence:update", presenceHandler);

      return () => {
        socket?.off("presence:update", presenceHandler);
      };
    }
  }, [userId]);

  return isOnline;
};
