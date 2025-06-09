import { useEffect, useState } from "react";
import { webSocketService } from "@/lib/websocket/websocketService";

export const useUserOnlineStatus = (userId?: string) => {
  const [isOnline, setIsOnline] = useState(false);

  // Ping/Pong mechanism to keep connection alive
  useEffect(() => {
    const socket = webSocketService.getSocket();

    const pingInterval = setInterval(() => {
      if (socket?.connected) {
        socket.emit("ping");
      }
    }, 25000);

    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    const socket = webSocketService.getSocket();
    if (!socket || !userId) return;

    // Subscribe to presence updates
    socket.emit("presence:subscribe", userId);

    // Request initial presence status
    socket.emit("presence:get", userId, (status: boolean) => {
      setIsOnline(status);
    });

    // Listen for presence updates
    const presenceHandler = (id: string, online: boolean) => {
      if (id === userId) {
        setIsOnline(online);
      }
    };

    socket.on("presence:update", presenceHandler);

    return () => {
      socket.off("presence:update", presenceHandler);
    };
  }, [userId]);

  return isOnline;
};
