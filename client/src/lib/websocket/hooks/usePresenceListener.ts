import { useEffect } from "react";
import { webSocketService } from "../services/websocket.service";
import { usePresenceStore } from "@/stores/chatPresenceStore";

export function usePresenceListener() {
  const setOnlineStatus = usePresenceStore((s) => s.setOnlineStatus);

  useEffect(() => {
    const socket = webSocketService.getSocket();
    if (!socket) return;

    const handleStatusChange = (data: {
      userId: string;
      isOnline: boolean;
    }) => {
      console.log("detect Friend isOnline", data.isOnline, data.userId);
      setOnlineStatus(data.userId, data.isOnline);
    };

    socket.on("chat:statusChanged", handleStatusChange);

    return () => {
      socket.off("chat:statusChanged", handleStatusChange);
    };
  }, [setOnlineStatus]);
}
