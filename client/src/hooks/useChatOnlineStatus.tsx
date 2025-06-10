// hooks/useChatOnlineStatus.ts
import { useEffect, useState } from "react";
import { webSocketService } from "@/lib/websocket/services/websocket.service";

export const chatGateway = "chat";

export const useChatOnlineStatus = (chatId?: string) => {
  const [isOnline, setIsOnline] = useState(false);
  console.log('chatId: ', chatId)
  useEffect(() => {
    if (!chatId) return;

    const socket = webSocketService.getSocket();
    console.log('socket: ', socket)

    // Wait for socket to be connected
    const checkStatus = () => {
      console.log("Socket connected:", socket?.connected);
      socket?.emit(
        `${chatGateway}:getStatus`,
        chatId,
        (response: { chatId: string; isOnline: boolean }) => {
          console.log("Status response:", response);
          if (response.chatId === chatId) {
            setIsOnline(response.isOnline);
          }
        }
      );
    };

    if (socket?.connected) {
      checkStatus();
    } else {
      const onConnect = () => {
        checkStatus();
        socket?.off("connect", onConnect);
      };
      socket?.on("connect", onConnect);
    }

    const statusHandler = (payload: { chatId: string; isOnline: boolean }) => {
      if (payload.chatId === chatId) {
        setIsOnline(payload.isOnline);
        console.log("isOnline?: ", payload.isOnline);
      } else {
        console.log("wrong chatId?: ", payload.chatId);
      }
    };

    socket?.on(`${chatGateway}:statusChanged`, statusHandler);

    return () => {
      socket?.off(`${chatGateway}:statusChanged`, statusHandler);
    };
  }, [chatId]);

  return isOnline;
};
